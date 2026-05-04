using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mindtag.API.Auth;
using Mindtag.API.Extensions;
using Mindtag.Core.DTOs.User;
using Mindtag.Core.Enums;
using Mindtag.Core.Interfaces;
using Mindtag.Infrastructure.Data;

namespace Mindtag.API.Controllers;

[Authorize]
[AuthorizeRoles("Admin")]
[ApiController]
[Route("admin")]
public sealed class AdminController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly AppDbContext _db;

    public AdminController(IUserService userService, AppDbContext db)
    {
        _userService = userService;
        _db = db;
    }

    /// <summary>GET /admin/users — list all users with optional role/search filter</summary>
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? role,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 20)
    {
        var query = _db.Users
            .Include(u => u.StudentProfile)
            .Include(u => u.DoctorProfile)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(role) && Enum.TryParse<UserRole>(role, true, out var parsedRole))
            query = query.Where(u => u.Role == parsedRole);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(u => u.FullName.Contains(search) || u.Email.Contains(search));

        var total = await query.CountAsync();

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .AsNoTracking()
            .ToListAsync();

        var items = users.Select(u => new UserProfileDTO(
            u.Id, u.Email, u.FullName, u.Role.ToString(),
            u.AvatarUrl, u.IsActive, u.CreatedAt, u.UpdatedAt,
            u.StudentProfile?.StudentId,
            u.StudentProfile?.Department ?? u.DoctorProfile?.Department,
            u.StudentProfile?.Year,
            u.DoctorProfile?.Title
        )).ToList();

        return Ok(new { success = true, data = new { items, total, page, limit } });
    }

    /// <summary>GET /admin/stats — platform overview statistics</summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var totalUsers = await _db.Users.CountAsync();
        var totalStudents = await _db.Users.CountAsync(u => u.Role == UserRole.Student);
        var totalDoctors = await _db.Users.CountAsync(u => u.Role == UserRole.Doctor);
        var totalCourses = await _db.Courses.CountAsync();
        var activeSessions = await _db.Sessions.CountAsync(s => s.Status == SessionStatus.Active);
        var attendanceToday = await _db.AttendanceRecords
            .CountAsync(a => a.ScannedAt.Date == DateTime.UtcNow.Date);

        return Ok(new
        {
            success = true,
            data = new
            {
                totalUsers,
                totalStudents,
                totalDoctors,
                totalCourses,
                activeSessions,
                attendanceToday
            }
        });
    }

    /// <summary>POST /admin/users — create a new user (admin can create any role)</summary>
    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] AdminCreateUserRequest request)
    {
        // Check if email already in use
        var existing = await _db.Users.AnyAsync(u => u.Email == request.Email);
        if (existing)
            return Conflict(new { success = false, error = new { code = "DUPLICATE_EMAIL", message = "Email already registered." } });

        var user = new Core.Entities.User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, 12),
            FullName = request.FullName,
            Role = Enum.Parse<UserRole>(request.Role, true),
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);

        // Create role-specific profile
        if (user.Role == UserRole.Student)
        {
            _db.StudentProfiles.Add(new Core.Entities.StudentProfile
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                StudentId = request.StudentId ?? $"MT-{new Random().Next(100000, 999999)}",
                Department = request.Department ?? "General",
                Year = request.Year ?? 1
            });
        }
        else if (user.Role == UserRole.Doctor)
        {
            _db.DoctorProfiles.Add(new Core.Entities.DoctorProfile
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Department = request.Department ?? "General",
                Title = request.Title ?? "Dr."
            });
        }

        await _db.SaveChangesAsync();

        return Created($"/admin/users/{user.Id}", new { success = true, data = new { user.Id, user.Email, user.FullName, Role = user.Role.ToString() } });
    }

    /// <summary>DELETE /admin/users/:id — soft delete a user</summary>
    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null)
            return NotFound(new { success = false, error = new { code = "NOT_FOUND", message = "User not found." } });

        user.IsActive = false;
        await _db.SaveChangesAsync();

        return Ok(new { success = true, message = "User deactivated." });
    }
}

public sealed record AdminCreateUserRequest(
    string Email,
    string Password,
    string FullName,
    string Role,
    string? StudentId,
    string? Department,
    int? Year,
    string? Title);
