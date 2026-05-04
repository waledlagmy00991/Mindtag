using DayOfWeek = Mindtag.Core.Enums.DayOfWeek;

namespace Mindtag.Core.Entities;

/// <summary>
/// Represents a recurring weekly time slot for a course (e.g., CS301 on Monday 10:30–12:00).
/// Unique constraint: (CourseId, DayOfWeek, StartTime).
/// </summary>
public sealed class CourseSchedule
{
    /// <summary>Primary key.</summary>
    public Guid Id { get; set; }

    /// <summary>Foreign key to the course.</summary>
    public Guid CourseId { get; set; }

    /// <summary>Day of the week this slot occurs.</summary>
    public DayOfWeek DayOfWeek { get; set; }

    /// <summary>Lecture start time.</summary>
    public TimeSpan StartTime { get; set; }

    /// <summary>Lecture end time.</summary>
    public TimeSpan EndTime { get; set; }

    /// <summary>Optional room/hall designation (e.g., "Hall B-12").</summary>
    public string? Room { get; set; }

    // ─── Navigation Properties ─────────────────────────────────────────────

    /// <summary>Parent course.</summary>
    public Course Course { get; set; } = null!;
}
