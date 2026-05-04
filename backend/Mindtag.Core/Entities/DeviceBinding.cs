namespace Mindtag.Core.Entities;

/// <summary>
/// Binds a user account to a specific physical device for anti-sharing enforcement.
/// One user → one active DeviceBinding at a time. PRD §14.3.
/// </summary>
public sealed class DeviceBinding
{
    /// <summary>Primary key.</summary>
    public Guid Id { get; set; }

    /// <summary>Foreign key to the bound user.</summary>
    public Guid UserId { get; set; }

    /// <summary>Unique device identifier (hardware ID or Keychain-stored UUID).</summary>
    public string DeviceId { get; set; } = string.Empty;

    /// <summary>JSON fingerprint: OS, brand, model, app version.</summary>
    public string DeviceFingerprint { get; set; } = string.Empty;

    /// <summary>Device platform ("android" or "ios").</summary>
    public string Platform { get; set; } = string.Empty;

    /// <summary>Whether this binding is currently active.</summary>
    public bool IsActive { get; set; } = true;

    /// <summary>When the device was first bound to the account (UTC).</summary>
    public DateTime BoundAt { get; set; }

    /// <summary>Last time the user was seen on this device (UTC).</summary>
    public DateTime LastSeenAt { get; set; }

    // ─── Navigation Properties ─────────────────────────────────────────────

    /// <summary>The bound user.</summary>
    public User User { get; set; } = null!;
}
