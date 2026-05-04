using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Mindtag.Core.DTOs.User;
using Mindtag.Core.Entities;
using Mindtag.Core.Enums;
using Mindtag.Core.Exceptions;
using Mindtag.Core.Interfaces;
using Mindtag.Infrastructure.Data;

namespace Mindtag.Infrastructure.Services;

/// <summary>
/// Implements user profile, password, and admin management logic (M3).
/// </summary>
public sealed class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly AppDbContext _db; // Needed just for deleting refresh tokens
    private readonly IAuditLogService _audit;

    public UserService(IUserRepository userRepository, AppDbContext db, IAuditLogService audit)
    {
        _userRepository = userRepository;
        _db = db;
        _audit = audit;
    }

    // ─── M3-T2: Get Me ─────────────────────────────────────────────────────────

    public async Task<UserProfileDTO> GetMeAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new AppException("NOT_FOUND", "User not found.");

        return MapToDTO(user);
    }

    // ─── M3-T3: Update Profile ─────────────────────────────────────────────────

    public async Task<UserProfileDTO> UpdateProfileAsync(Guid userId, UpdateProfileRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new AppException("NOT_FOUND", "User not found.");

        if (request.FullName is not null)
        {
            if (string.IsNullOrWhiteSpace(request.FullName))
                throw new AppException("VALIDATION_ERROR", "FullName cannot be empty.");
            user.FullName = request.FullName;
        }

        if (request.AvatarUrl is not null)
        {
            if (!Uri.TryCreate(request.AvatarUrl, UriKind.Absolute, out _))
                throw new AppException("VALIDATION_ERROR", "AvatarUrl must be a valid URL.");
            user.AvatarUrl = request.AvatarUrl;
        }

        // Role-specific profile updates
        if (user.Role == UserRole.Student)
        {
            user.StudentProfile ??= new StudentProfile { Id = user.Id };
            if (request.StudentId is not null) user.StudentProfile.StudentId = request.StudentId;
            if (request.Department is not null) user.StudentProfile.Department = request.Department;
            if (request.Year is not null) user.StudentProfile.Year = request.Year.Value;
        }
        else if (user.Role == UserRole.Doctor)
        {
            user.DoctorProfile ??= new DoctorProfile { Id = user.Id };
            if (request.Title is not null) user.DoctorProfile.Title = request.Title;
            if (request.Department is not null) user.DoctorProfile.Department = request.Department;
        }

        await _userRepository.UpdateAsync(user);

        return MapToDTO(user);
    }

    // ─── M3-T4: Change Password ────────────────────────────────────────────────

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new AppException("NOT_FOUND", "User not found.");

        // Verify current password
        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            await _audit.LogAsync(userId, AuditAction.PasswordChanged, user.Id.ToString(), "{\"reason\":\"invalid_current_password\"}", false);
            throw new AppException("INVALID_CREDENTIALS", "Invalid current password.");
        }

        // Validate new password rules
        if (request.NewPassword.Length < 8 ||
            !Regex.IsMatch(request.NewPassword, @"[A-Z]") ||
            !Regex.IsMatch(request.NewPassword, @"\d"))
        {
            throw new AppException("VALIDATION_ERROR", "New password must be at least 8 characters with 1 uppercase letter and 1 digit.");
        }

        // Hash and update
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword, 12);
        await _userRepository.UpdateAsync(user);

        // Invalidate all refresh tokens to force re-login everywhere (PRD §14.3.4)
        var tokens = await _db.RefreshTokens.Where(rt => rt.UserId == userId).ToListAsync();
        if (tokens.Count != 0)
        {
            _db.RefreshTokens.RemoveRange(tokens);
            await _db.SaveChangesAsync();
        }

        await _audit.LogAsync(userId, AuditAction.PasswordChanged, user.Id.ToString());
    }

    // ─── M3-T5: Admin - Get User By Id ─────────────────────────────────────────

    public async Task<UserProfileDTO> GetUserByIdAsync(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id)
            ?? throw new AppException("NOT_FOUND", "User not found.");

        return MapToDTO(user);
    }

    // ─── M3-T5: Admin - Update User Status ─────────────────────────────────────

    public async Task<UserProfileDTO> UpdateUserStatusAsync(Guid id, UpdateUserStatusRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id)
            ?? throw new AppException("NOT_FOUND", "User not found.");

        // If status changed from Active -> Inactive
        if (user.IsActive && !request.IsActive)
        {
            user.IsActive = false;
            
            // Invalidate all their sessions
            var tokens = await _db.RefreshTokens.Where(rt => rt.UserId == id).ToListAsync();
            if (tokens.Count != 0)
            {
                _db.RefreshTokens.RemoveRange(tokens);
                await _db.SaveChangesAsync();
            }

            await _audit.LogAsync(null, AuditAction.UserDeactivated, user.Id.ToString()); // system action
        }
        else if (!user.IsActive && request.IsActive)
        {
            user.IsActive = true;
            await _audit.LogAsync(null, AuditAction.UserCreated, user.Id.ToString(), "{\"action\":\"reactivated\"}");
        }

        await _userRepository.UpdateAsync(user);

        return MapToDTO(user);
    }

    // ─── Private Mappers ───────────────────────────────────────────────────────

    private static UserProfileDTO MapToDTO(User user)
    {
        return new UserProfileDTO(
            Id: user.Id,
            Email: user.Email,
            FullName: user.FullName,
            Role: user.Role.ToString(),
            AvatarUrl: user.AvatarUrl,
            IsActive: user.IsActive,
            CreatedAt: user.CreatedAt,
            UpdatedAt: user.UpdatedAt,

            // Pull conditional fields (null if the user doesn't have the profile)
            StudentId: user.StudentProfile?.StudentId,
            Department: user.StudentProfile?.Department ?? user.DoctorProfile?.Department,
            Year: user.StudentProfile?.Year,
            Title: user.DoctorProfile?.Title
        );
    }
}
