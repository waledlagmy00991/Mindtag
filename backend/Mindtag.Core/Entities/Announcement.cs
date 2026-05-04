namespace Mindtag.Core.Entities;

/// <summary>
/// Represents a course-level or global announcement from a doctor or admin.
/// </summary>
public sealed class Announcement
{
    /// <summary>Primary key.</summary>
    public Guid Id { get; set; }

    /// <summary>Foreign key to the course. Null for global announcements (admin only).</summary>
    public Guid? CourseId { get; set; }

    /// <summary>Foreign key to the user who created the announcement.</summary>
    public Guid AuthorId { get; set; }

    /// <summary>Announcement title.</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Announcement body text.</summary>
    public string Body { get; set; } = string.Empty;

    /// <summary>Creation timestamp (UTC).</summary>
    public DateTime CreatedAt { get; set; }

    // ─── Navigation Properties ─────────────────────────────────────────────

    /// <summary>The course (null if global).</summary>
    public Course? Course { get; set; }

    /// <summary>The author (doctor or admin).</summary>
    public User Author { get; set; } = null!;
}
