namespace Mindtag.Core.Entities;

/// <summary>
/// Represents an academic course managed by a doctor.
/// </summary>
public sealed class Course
{
    /// <summary>Primary key.</summary>
    public Guid Id { get; set; }

    /// <summary>Course display name (e.g., "Advanced UX Design").</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Unique course code (e.g., "CS301").</summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>Optional course description.</summary>
    public string? Description { get; set; }

    /// <summary>Number of credit hours. Default: 3.</summary>
    public int CreditHours { get; set; } = 3;

    /// <summary>Foreign key to the doctor who owns this course.</summary>
    public Guid DoctorId { get; set; }

    /// <summary>Default latitude for session location.</summary>
    public double? DefaultLocationLat { get; set; }

    /// <summary>Default longitude for session location.</summary>
    public double? DefaultLocationLng { get; set; }

    /// <summary>Human-readable location name (e.g., "Hall B-12, Science Block").</summary>
    public string? LocationName { get; set; }

    /// <summary>Maximum allowed absences before risk. Default: 5. PRD §14.5.1.</summary>
    public int AbsenceLimit { get; set; } = 5;

    /// <summary>If true, Late attendance counts as an absence. Default: false. PRD §14.5.1.</summary>
    public bool CountLateAsAbsence { get; set; } = false;

    /// <summary>Soft-delete flag.</summary>
    public bool IsActive { get; set; } = true;

    /// <summary>Course creation timestamp (UTC).</summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>Course last updated timestamp (UTC).</summary>
    public DateTime UpdatedAt { get; set; }

    // ─── Navigation Properties ─────────────────────────────────────────────

    /// <summary>The doctor who teaches this course.</summary>
    public User Doctor { get; set; } = null!;

    /// <summary>Student enrollments.</summary>
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();

    /// <summary>Lecture sessions.</summary>
    public ICollection<Session> Sessions { get; set; } = new List<Session>();

    /// <summary>Weekly schedule slots.</summary>
    public ICollection<CourseSchedule> Schedules { get; set; } = new List<CourseSchedule>();

    /// <summary>Course announcements.</summary>
    public ICollection<Announcement> Announcements { get; set; } = new List<Announcement>();
}
