using Mindtag.Core.Enums;

namespace Mindtag.Core.Entities;

/// <summary>
/// Represents a user in the Mindtag system (Student, Doctor, or Admin).
/// </summary>
public sealed class User
{
    /// <summary>Primary key.</summary>
    public Guid Id { get; set; }

    /// <summary>University email address (unique, validated against allowed domains).</summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>BCrypt-hashed password (cost factor 12).</summary>
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>Full display name of the user.</summary>
    public string FullName { get; set; } = string.Empty;

    /// <summary>Role determining access level and available features.</summary>
    public UserRole Role { get; set; }

    /// <summary>Firebase Cloud Messaging token for push notifications. Null if not registered.</summary>
    public string? FcmToken { get; set; }

    /// <summary>URL to the user's avatar image in Azure Blob Storage.</summary>
    public string? AvatarUrl { get; set; }

    /// <summary>Soft-delete flag. Inactive users cannot log in.</summary>
    public bool IsActive { get; set; } = true;

    /// <summary>Account creation timestamp (UTC).</summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>Last profile update timestamp (UTC).</summary>
    public DateTime UpdatedAt { get; set; }

    // ─── Navigation Properties ─────────────────────────────────────────────

    /// <summary>Student profile (null if user is not a Student).</summary>
    public StudentProfile? StudentProfile { get; set; }

    /// <summary>Doctor profile (null if user is not a Doctor).</summary>
    public DoctorProfile? DoctorProfile { get; set; }

    /// <summary>Course enrollments (Student only).</summary>
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();

    /// <summary>Attendance records (Student only).</summary>
    public ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();

    /// <summary>Personal schedule slots (Student only).</summary>
    public ICollection<StudentScheduleSlot> ScheduleSlots { get; set; } = new List<StudentScheduleSlot>();

    /// <summary>Courses taught by this user (Doctor only).</summary>
    public ICollection<Course> TaughtCourses { get; set; } = new List<Course>();

    /// <summary>Sessions started by this user (Doctor only).</summary>
    public ICollection<Session> Sessions { get; set; } = new List<Session>();

    /// <summary>Notifications received by this user.</summary>
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    /// <summary>Active refresh tokens for this user.</summary>
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
