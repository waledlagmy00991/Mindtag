namespace Mindtag.Core.Settings;

/// <summary>
/// Strongly-typed configuration for device binding security.
/// Bound to the "DeviceSecurity" section of appsettings.json.
/// </summary>
public sealed class DeviceSecuritySettings
{
    /// <summary>
    /// Section name in appsettings.json.
    /// </summary>
    public static readonly string SectionName = "DeviceSecurity";

    /// <summary>
    /// Expiry time (in minutes) for device reset tokens stored in Redis. Default: 30.
    /// </summary>
    public int ResetTokenExpiryMinutes { get; set; } = 30;

    /// <summary>
    /// Whether a user can be bound to multiple devices simultaneously. Default: false.
    /// </summary>
    public bool AllowMultipleDevices { get; set; } = false;
}
