using Mindtag.Core.Enums;

namespace Mindtag.Core.Entities;

/// <summary>
/// Represents a student's enrollment in a course.
/// Unique constraint: (StudentId, CourseId).
/// </summary>
public sealed class Enrollment
{
    /// <summary>Primary key.</summary>
    public Guid Id { get; set; }

    /// <summary>Foreign key to the enrolled student.</summary>
    public Guid StudentId { get; set; }

    /// <summary>Foreign key to the course.</summary>
    public Guid CourseId { get; set; }

    /// <summary>Enrollment timestamp (UTC).</summary>
    public DateTime EnrolledAt { get; set; }

    /// <summary>Computed risk status based on attendance percentage. PRD §14.7.3.</summary>
    public RiskStatus RiskStatus { get; set; } = RiskStatus.Safe;

    /// <summary>When the risk status was last recalculated (UTC). PRD §14.7.3.</summary>
    public DateTime RiskStatusUpdatedAt { get; set; }

    // ─── Navigation Properties ─────────────────────────────────────────────

    /// <summary>The enrolled student.</summary>
    public User Student { get; set; } = null!;

    /// <summary>The course.</summary>
    public Course Course { get; set; } = null!;
}
