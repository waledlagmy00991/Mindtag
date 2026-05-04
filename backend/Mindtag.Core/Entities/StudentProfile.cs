namespace Mindtag.Core.Entities;

/// <summary>
/// Extended profile data for users with the Student role.
/// </summary>
public sealed class StudentProfile
{
    /// <summary>Primary key.</summary>
    public Guid Id { get; set; }

    /// <summary>Foreign key to the parent User.</summary>
    public Guid UserId { get; set; }

    /// <summary>University-issued student ID (e.g., "MT-884291").</summary>
    public string StudentId { get; set; } = string.Empty;

    /// <summary>Academic department (e.g., "COMPUTER SCIENCE").</summary>
    public string Department { get; set; } = string.Empty;

    /// <summary>Current academic year (1–5).</summary>
    public int Year { get; set; }

    // ─── Navigation Properties ─────────────────────────────────────────────

    /// <summary>Parent user.</summary>
    public User User { get; set; } = null!;
}
