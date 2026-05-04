namespace Mindtag.Core.Settings;

/// <summary>
/// Strongly-typed configuration for QR code security.
/// Bound to the "QrSecurity" section of appsettings.json.
/// </summary>
public sealed class QrSecuritySettings
{
    /// <summary>
    /// Section name in appsettings.json.
    /// </summary>
    public static readonly string SectionName = "QrSecurity";

    /// <summary>
    /// HMAC-SHA256 secret used to sign QR payloads. Must be a 64-char hex string.
    /// </summary>
    public string HmacSecret { get; set; } = string.Empty;

    /// <summary>
    /// Allowed clock skew tolerance (in seconds) between server time and QR iat/exp. Default: 2.
    /// </summary>
    public int ClockSkewToleranceSeconds { get; set; } = 2;

    /// <summary>
    /// QR rotation interval in seconds. Default: 5.
    /// </summary>
    public int RotationIntervalSeconds { get; set; } = 5;

    /// <summary>
    /// QR token time-to-live in seconds (rotation interval + grace). Default: 6.
    /// </summary>
    public int TokenTtlSeconds { get; set; } = 6;
}
