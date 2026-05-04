namespace Mindtag.Core.Entities;

/// <summary>
/// Represents a hashed refresh token stored in the database.
/// Raw token is never persisted — only SHA256(raw) is stored.
/// </summary>
public sealed class RefreshToken
{
    /// <summary>Primary key.</summary>
    public Guid Id { get; set; }

    /// <summary>Foreign key to the token owner.</summary>
    public Guid UserId { get; set; }

    /// <summary>SHA256 hash of the raw refresh token. Raw value is never stored.</summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>Token expiry timestamp (UTC).</summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>Token creation timestamp (UTC).</summary>
    public DateTime CreatedAt { get; set; }

    // ─── Navigation Properties ─────────────────────────────────────────────

    /// <summary>The token owner.</summary>
    public User User { get; set; } = null!;
}
