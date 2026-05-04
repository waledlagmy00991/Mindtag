using Mindtag.Core.Enums;

namespace Mindtag.Core.Entities;

/// <summary>
/// Represents a student's attendance record for a specific session.
/// Unique constraint: (SessionId, StudentId).
/// </summary>
public sealed class AttendanceRecord
{
    /// <summary>Primary key.</summary>
    public Guid Id { get; set; }

    /// <summary>Foreign key to the session.</summary>
    public Guid SessionId { get; set; }

    /// <summary>Foreign key to the student.</summary>
    public Guid StudentId { get; set; }

    /// <summary>Attendance status: Present (≤15min), Late (15–30min), or Absent.</summary>
    public AttendanceStatus Status { get; set; } = AttendanceStatus.Present;

    /// <summary>Timestamp when the QR was scanned (UTC).</summary>
    public DateTime ScannedAt { get; set; }

    /// <summary>Student's latitude at scan time.</summary>
    public double StudentLat { get; set; }

    /// <summary>Student's longitude at scan time.</summary>
    public double StudentLng { get; set; }

    /// <summary>Haversine distance (meters) from the session location at scan time.</summary>
    public double Distance { get; set; }

    /// <summary>Whether this record was flagged for suspicious activity. PRD §14.2.3.</summary>
    public bool IsSuspicious { get; set; } = false;

    /// <summary>Reason for suspicious flag (e.g., "SPEED_ANOMALY"). PRD §14.2.3.</summary>
    public string? SuspiciousReason { get; set; }

    // ─── Navigation Properties ─────────────────────────────────────────────

    /// <summary>The session this record belongs to.</summary>
    public Session Session { get; set; } = null!;

    /// <summary>The student who checked in.</summary>
    public User Student { get; set; } = null!;
}
