namespace Mindtag.Core.Entities;

/// <summary>
/// Extended profile data for users with the Doctor role.
/// </summary>
public sealed class DoctorProfile
{
    /// <summary>Primary key.</summary>
    public Guid Id { get; set; }

    /// <summary>Foreign key to the parent User.</summary>
    public Guid UserId { get; set; }

    /// <summary>Academic department.</summary>
    public string Department { get; set; } = string.Empty;

    /// <summary>Academic title (e.g., "Dr.", "Prof.", "Assoc. Prof.").</summary>
    public string Title { get; set; } = "Dr.";

    // ─── Navigation Properties ─────────────────────────────────────────────

    /// <summary>Parent user.</summary>
    public User User { get; set; } = null!;
}
