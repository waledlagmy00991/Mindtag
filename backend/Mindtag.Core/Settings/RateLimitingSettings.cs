namespace Mindtag.Core.Settings;

/// <summary>
/// Strongly-typed configuration for user-level rate limiting.
/// Bound to the "RateLimiting" section of appsettings.json.
/// Note: IP-level rate limiting is handled by AspNetCoreRateLimit via "IpRateLimiting" section.
/// </summary>
public sealed class RateLimitingSettings
{
    /// <summary>
    /// Section name in appsettings.json.
    /// </summary>
    public static readonly string SectionName = "RateLimiting";

    /// <summary>
    /// Maximum failed login attempts before account lockout. Default: 10.
    /// </summary>
    public int LoginMaxAttempts { get; set; } = 10;

    /// <summary>
    /// Sliding window (in minutes) for counting failed login attempts. Default: 15.
    /// </summary>
    public int LoginWindowMinutes { get; set; } = 15;

    /// <summary>
    /// Duration (in minutes) the account remains locked after exceeding max attempts. Default: 15.
    /// </summary>
    public int LockoutDurationMinutes { get; set; } = 15;

    /// <summary>
    /// Maximum attendance scan attempts per user within the scan window. Default: 5.
    /// </summary>
    public int ScanMaxAttempts { get; set; } = 5;

    /// <summary>
    /// Sliding window (in minutes) for counting scan attempts per user. Default: 10.
    /// </summary>
    public int ScanWindowMinutes { get; set; } = 10;
}
