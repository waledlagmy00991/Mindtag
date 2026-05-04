namespace Mindtag.Core.Settings;

/// <summary>
/// Strongly-typed configuration for JWT authentication.
/// Bound to the "Jwt" section of appsettings.json.
/// </summary>
public sealed class JwtSettings
{
    /// <summary>
    /// Section name in appsettings.json.
    /// </summary>
    public static readonly string SectionName = "Jwt";

    /// <summary>
    /// HMAC-SHA256 secret for signing access tokens. Must be a 64-char hex string.
    /// </summary>
    public string AccessSecret { get; set; } = string.Empty;

    /// <summary>
    /// HMAC-SHA256 secret for signing refresh tokens. Must be a 64-char hex string.
    /// </summary>
    public string RefreshSecret { get; set; } = string.Empty;

    /// <summary>
    /// Access token lifetime in minutes. Default: 15.
    /// </summary>
    public int AccessExpiryMinutes { get; set; } = 15;

    /// <summary>
    /// Refresh token lifetime in days. Default: 7.
    /// </summary>
    public int RefreshExpiryDays { get; set; } = 7;

    /// <summary>
    /// Maximum number of active refresh tokens allowed per user. Default: 5.
    /// </summary>
    public int MaxRefreshTokensPerUser { get; set; } = 5;
}
