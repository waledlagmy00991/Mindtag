using Mindtag.Core.Enums;

namespace Mindtag.Core.Entities;

/// <summary>
/// Represents a live lecture session started by a doctor. QR token rotates every 5 seconds.
/// </summary>
public sealed class Session
{
    /// <summary>Primary key.</summary>
    public Guid Id { get; set; }

    /// <summary>Foreign key to the course.</summary>
    public Guid CourseId { get; set; }

    /// <summary>Foreign key to the doctor who started the session.</summary>
    public Guid DoctorId { get; set; }

    /// <summary>Current lifecycle status of the session.</summary>
    public SessionStatus Status { get; set; } = SessionStatus.Active;

    /// <summary>Latitude of the session location (used for GPS distance check).</summary>
    public double LocationLat { get; set; }

    /// <summary>Longitude of the session location.</summary>
    public double LocationLng { get; set; }

    /// <summary>Current valid QR token (rotates every 5 seconds via Hangfire).</summary>
    public string CurrentQrToken { get; set; } = string.Empty;

    /// <summary>Expiry time of the current QR token (UTC).</summary>
    public DateTime QrExpiresAt { get; set; }

    /// <summary>Session start timestamp (UTC).</summary>
    public DateTime StartedAt { get; set; }

    /// <summary>Session end timestamp (UTC). Null while session is active.</summary>
    public DateTime? EndedAt { get; set; }

    /// <summary>Denormalized count of present students for fast display.</summary>
    public int TotalPresent { get; set; } = 0;

    // ─── Navigation Properties ─────────────────────────────────────────────

    /// <summary>The course this session belongs to.</summary>
    public Course Course { get; set; } = null!;

    /// <summary>The doctor who started this session.</summary>
    public User Doctor { get; set; } = null!;

    /// <summary>Attendance records for this session.</summary>
    public ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();
}
