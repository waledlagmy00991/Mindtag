using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Mindtag.Core.DTOs.Auth;
using Mindtag.Core.Entities;
using Mindtag.Core.Enums;
using Mindtag.Core.Exceptions;
using Mindtag.Core.Interfaces;
using Mindtag.Infrastructure.Data;
using Mindtag.Infrastructure.Utils;

namespace Mindtag.Infrastructure.Services;

/// <summary>
/// Authentication service implementing all auth flows per PRD §5.1 + §14.
/// </summary>
public sealed class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly JwtHelper _jwt;
    private readonly IRedisService _redis;
    private readonly IAuditLogService _audit;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        AppDbContext db,
        JwtHelper jwt,
        IRedisService redis,
        IAuditLogService audit,
        IConfiguration config,
        ILogger<AuthService> logger)
    {
        _db = db;
        _jwt = jwt;
        _redis = redis;
        _audit = audit;
        _config = config;
        _logger = logger;
    }

    // ─── Register ──────────────────────────────────────────────────────────

    public async Task<AuthResponseDTO> RegisterAsync(RegisterRequest req)
    {
        // 1. Validate email domain
        var allowedDomains = _config.GetSection("AllowedEmailDomains").Get<string[]>() ?? [];
        var emailDomain = req.Email.Split('@').LastOrDefault()?.ToLowerInvariant();
        if (emailDomain is null || !allowedDomains.Contains(emailDomain, StringComparer.OrdinalIgnoreCase))
            throw new AppException("EMAIL_NOT_UNIVERSITY", "Email domain is not allowed.");

        // 2. Validate password strength
        if (req.Password.Length < 8 ||
            !Regex.IsMatch(req.Password, @"[A-Z]") ||
            !Regex.IsMatch(req.Password, @"\d"))
            throw new AppException("VALIDATION_ERROR", "Password must be at least 8 characters with 1 uppercase letter and 1 digit.");

        // 3. Check email uniqueness
        if (await _db.Users.AnyAsync(u => u.Email.ToLower() == req.Email.ToLower()))
            throw new AppException("VALIDATION_ERROR", "Email already registered.");

        // 3.5 Check StudentId uniqueness
        if (req.Role?.Equals("Student", StringComparison.OrdinalIgnoreCase) == true && !string.IsNullOrWhiteSpace(req.StudentId))
        {
            if (await _db.StudentProfiles.AnyAsync(p => p.StudentId == req.StudentId))
                throw new AppException("VALIDATION_ERROR", "This Student ID is already registered to another account.");
        }

        // 4. Parse and validate role
        if (!Enum.TryParse<UserRole>(req.Role, true, out var role) || role == UserRole.Admin)
            throw new AppException("VALIDATION_ERROR", "Invalid role. Must be Student or Doctor.");

        // 5. Create user
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = req.Email.ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password, workFactor: 12),
            FullName = req.FullName,
            Role = role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.Users.Add(user);

        // 6. Create profile (optional at registration, can be done in Profile Setup)
        if (role == UserRole.Student && !string.IsNullOrWhiteSpace(req.StudentId))
        {
            _db.StudentProfiles.Add(new StudentProfile
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                StudentId = req.StudentId,
                Department = req.Department ?? "Unassigned",
                Year = req.Year ?? 1
            });

            // Handle initial course enrollments if provided
            if (req.CourseIds != null && req.CourseIds.Any())
            {
                foreach (var courseId in req.CourseIds)
                {
                    _db.Enrollments.Add(new Enrollment
                    {
                        Id = Guid.NewGuid(),
                        StudentId = user.Id,
                        CourseId = courseId,
                        EnrolledAt = DateTime.UtcNow
                    });
                }
            }
        }
        else if (role == UserRole.Doctor && !string.IsNullOrWhiteSpace(req.Title))
        {
            _db.DoctorProfiles.Add(new DoctorProfile
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Department = req.Department ?? "General",
                Title = req.Title ?? "Dr."
            });
        }

        // 7. Create device binding
        _db.DeviceBindings.Add(new DeviceBinding
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            DeviceId = req.DeviceId,
            DeviceFingerprint = req.DeviceFingerprint,
            Platform = req.Platform,
            IsActive = true,
            BoundAt = DateTime.UtcNow,
            LastSeenAt = DateTime.UtcNow
        });

        // 8. Issue tokens
        var accessToken = _jwt.GenerateAccessToken(user.Id, role.ToString(), user.Email);
        var rawRefresh = JwtHelper.GenerateRefreshToken();

        _db.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = HashToken(rawRefresh),
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();

        // 9. Audit log
        await _audit.LogAsync(user.Id, AuditAction.UserCreated, user.Id.ToString());

        return BuildResponse(user, accessToken, rawRefresh);
    }

    // ─── Login ─────────────────────────────────────────────────────────────

    public async Task<AuthResponseDTO> LoginAsync(LoginRequest req)
    {
        try
        {
            var email = req.Email.ToLowerInvariant();
            _logger.LogDebug("Login attempt for {Email}", email);

            // 1. Find user
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user is null)
                throw new AppException("INVALID_CREDENTIALS", "Invalid email or password.");

            // 2. Check account lockout
            var lockoutKey = $"lockout:{email}";
            if (await _redis.GetAsync(lockoutKey) is not null)
                throw new AppException("ACCOUNT_LOCKED", "Account is temporarily locked. Try again later.");

            // 3. Verify password
            if (!BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            {
                var failKey = $"loginfail:{email}";
                var failCount = await _redis.IncrementAsync(failKey);
                await _redis.ExpireAsync(failKey, TimeSpan.FromMinutes(15));

                if (failCount >= 10)
                {
                    await _redis.SetAsync(lockoutKey, "1", TimeSpan.FromMinutes(15));
                    await _redis.DeleteAsync(failKey);
                    await _audit.LogAsync(user.Id, AuditAction.AccountLocked, user.Id.ToString(), isSuccess: false);
                }

                await _audit.LogAsync(user.Id, AuditAction.LoginFailure, user.Id.ToString(), isSuccess: false);
                throw new AppException("INVALID_CREDENTIALS", "Invalid email or password.");
            }

            // 4. Check active
            if (!user.IsActive)
                throw new AppException("FORBIDDEN", "Account is deactivated.");

            // 5. Device binding check
            var activeBinding = await _db.DeviceBindings
                .FirstOrDefaultAsync(db => db.UserId == user.Id && db.IsActive);

            if (activeBinding is null)
            {
                _db.DeviceBindings.Add(new DeviceBinding
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    DeviceId = req.DeviceId,
                    DeviceFingerprint = req.DeviceFingerprint,
                    Platform = req.Platform,
                    IsActive = true,
                    BoundAt = DateTime.UtcNow,
                    LastSeenAt = DateTime.UtcNow
                });
            }
            else if (activeBinding.DeviceId == req.DeviceId)
            {
                activeBinding.LastSeenAt = DateTime.UtcNow;
            }
            else
            {
                await _audit.LogAsync(user.Id, AuditAction.LoginFromUnknownDevice,
                    user.Id.ToString(), $"{{\"deviceId\":\"{req.DeviceId}\"}}", false);
                throw new AppException("DEVICE_MISMATCH", "Login from unrecognized device. Request a device reset.");
            }

            // 6. Prune old refresh tokens (keep max 5)
            var existingTokens = await _db.RefreshTokens
                .Where(rt => rt.UserId == user.Id)
                .OrderBy(rt => rt.CreatedAt)
                .ToListAsync();

            if (existingTokens.Count >= 5)
            {
                var toRemove = existingTokens.Take(existingTokens.Count - 4).ToList();
                _db.RefreshTokens.RemoveRange(toRemove);
            }

            // 7. Issue tokens
            var accessToken = _jwt.GenerateAccessToken(user.Id, user.Role.ToString(), user.Email);
            var rawRefresh = JwtHelper.GenerateRefreshToken();

            _db.RefreshTokens.Add(new RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Token = HashToken(rawRefresh),
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                CreatedAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();

            // 8. Clear fail counter on success
            await _redis.DeleteAsync($"loginfail:{email}");

            await _audit.LogAsync(user.Id, AuditAction.LoginSuccess, user.Id.ToString());

            return BuildResponse(user, accessToken, rawRefresh);
        }
        catch (Exception ex) when (ex is not AppException)
        {
            _logger.LogError(ex, "Unhandled error during Login for {Email}", req.Email);
            throw;
        }
    }

    // ─── Refresh ───────────────────────────────────────────────────────────

    public async Task<AuthResponseDTO> RefreshAsync(RefreshRequest req)
    {
        var hashedToken = HashToken(req.RefreshToken);

        var storedToken = await _db.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == hashedToken);

        if (storedToken is null)
            throw new AppException("TOKEN_INVALID", "Refresh token is invalid.");

        if (storedToken.ExpiresAt < DateTime.UtcNow)
        {
            _db.RefreshTokens.Remove(storedToken);
            await _db.SaveChangesAsync();
            throw new AppException("TOKEN_EXPIRED", "Refresh token has expired.");
        }

        // Rotate: delete old, issue new
        _db.RefreshTokens.Remove(storedToken);

        var user = storedToken.User;
        var accessToken = _jwt.GenerateAccessToken(user.Id, user.Role.ToString(), user.Email);
        var rawRefresh = JwtHelper.GenerateRefreshToken();

        _db.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = HashToken(rawRefresh),
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();

        return BuildResponse(user, accessToken, rawRefresh);
    }

    // ─── Logout ────────────────────────────────────────────────────────────

    public async Task LogoutAsync(Guid userId, LogoutRequest req)
    {
        var hashedToken = HashToken(req.RefreshToken);
        var token = await _db.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == hashedToken && rt.UserId == userId);

        if (token is not null)
            _db.RefreshTokens.Remove(token);

        // Clear FCM token
        var user = await _db.Users.FindAsync(userId);
        if (user is not null)
            user.FcmToken = null;

        await _db.SaveChangesAsync();
    }

    // ─── FCM Token ─────────────────────────────────────────────────────────

    public async Task UpdateFcmTokenAsync(Guid userId, string fcmToken)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new AppException("NOT_FOUND", "User not found.");

        user.FcmToken = fcmToken;
        await _db.SaveChangesAsync();
    }

    // ─── Device Reset Request ──────────────────────────────────────────────

    public async Task DeviceResetRequestAsync(string email)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email.ToLowerInvariant());
        if (user is null)
            return; // Don't leak email existence

        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        await _redis.SetAsync($"device-reset:{email.ToLowerInvariant()}", token, TimeSpan.FromMinutes(30));

        // TODO: Send email via SMTP (M5 implementation)
        _logger.LogInformation("Device reset token for {Email}: {Token}", email, token);
    }

    // ─── Device Reset Confirm ──────────────────────────────────────────────

    public async Task<AuthResponseDTO> DeviceResetConfirmAsync(DeviceResetConfirmRequest req)
    {
        var redisKey = $"device-reset:{req.Email.ToLowerInvariant()}";
        var storedToken = await _redis.GetAsync(redisKey);

        if (storedToken is null)
            throw new AppException("TOKEN_INVALID", "Device reset token is invalid or expired.");

        // Constant-time comparison
        var storedBytes = Encoding.UTF8.GetBytes(storedToken);
        var incomingBytes = Encoding.UTF8.GetBytes(req.Token);
        if (!CryptographicOperations.FixedTimeEquals(storedBytes, incomingBytes))
            throw new AppException("TOKEN_INVALID", "Device reset token is invalid.");

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == req.Email.ToLowerInvariant())
            ?? throw new AppException("NOT_FOUND", "User not found.");

        // Deactivate old bindings
        var oldBindings = await _db.DeviceBindings
            .Where(db => db.UserId == user.Id && db.IsActive)
            .ToListAsync();
        foreach (var b in oldBindings) b.IsActive = false;

        // Create new binding
        _db.DeviceBindings.Add(new DeviceBinding
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            DeviceId = req.NewDeviceId,
            DeviceFingerprint = req.DeviceFingerprint,
            Platform = req.Platform,
            IsActive = true,
            BoundAt = DateTime.UtcNow,
            LastSeenAt = DateTime.UtcNow
        });

        // Invalidate all refresh tokens
        var tokens = await _db.RefreshTokens.Where(rt => rt.UserId == user.Id).ToListAsync();
        _db.RefreshTokens.RemoveRange(tokens);

        // Issue new tokens
        var accessToken = _jwt.GenerateAccessToken(user.Id, user.Role.ToString(), user.Email);
        var rawRefresh = JwtHelper.GenerateRefreshToken();

        _db.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = HashToken(rawRefresh),
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();

        // Cleanup Redis key
        await _redis.DeleteAsync(redisKey);

        await _audit.LogAsync(user.Id, AuditAction.DeviceReset, user.Id.ToString());

        return BuildResponse(user, accessToken, rawRefresh);
    }

    // ─── Helpers ───────────────────────────────────────────────────────────

    private static string HashToken(string rawToken)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    private static AuthResponseDTO BuildResponse(User user, string accessToken, string rawRefresh)
    {
        var isProfileComplete = user.Role == UserRole.Student 
            ? user.StudentProfile != null 
            : user.DoctorProfile != null;

        return new AuthResponseDTO(
            new UserDTO(user.Id, user.Email, user.FullName, user.Role.ToString(), user.AvatarUrl, isProfileComplete, user.CreatedAt),
            accessToken,
            rawRefresh);
    }
}
