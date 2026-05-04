using DayOfWeek = Mindtag.Core.Enums.DayOfWeek;

namespace Mindtag.Core.Entities;

/// <summary>
/// A student's personal timetable entry. May or may not be linked to a formal course.
/// Supports Arabic and English text for SubjectName and Location.
/// </summary>
public sealed class StudentScheduleSlot
{
    /// <summary>Primary key.</summary>
    public Guid Id { get; set; }

    /// <summary>Foreign key to the student who owns this slot.</summary>
    public Guid StudentId { get; set; }

    /// <summary>Subject/lecture name (supports Arabic + English).</summary>
    public string SubjectName { get; set; } = string.Empty;

    /// <summary>Day of the week.</summary>
    public DayOfWeek DayOfWeek { get; set; }

    /// <summary>Lecture start time.</summary>
    public TimeSpan StartTime { get; set; }

    /// <summary>Lecture end time.</summary>
    public TimeSpan EndTime { get; set; }

    /// <summary>Optional location (supports Arabic + English).</summary>
    public string? Location { get; set; }

    /// <summary>Optional instructor/professor name.</summary>
    public string? InstructorName { get; set; }

    /// <summary>Optional link to a formal course if the student is enrolled.</summary>
    public Guid? CourseId { get; set; }

    /// <summary>Slot creation timestamp (UTC).</summary>
    public DateTime CreatedAt { get; set; }

    // ─── Navigation Properties ─────────────────────────────────────────────

    /// <summary>The student who owns this slot.</summary>
    public User Student { get; set; } = null!;

    /// <summary>Linked course (null if personal/unlinked).</summary>
    public Course? Course { get; set; }
}
