namespace Mindtag.Core.Settings;

/// <summary>
/// Strongly-typed configuration for audit log retention.
/// Bound to the "AuditLog" section of appsettings.json.
/// </summary>
public sealed class AuditLogSettings
{
    /// <summary>
    /// Section name in appsettings.json.
    /// </summary>
    public static readonly string SectionName = "AuditLog";

    /// <summary>
    /// Number of days to retain audit log entries before cleanup. Default: 90.
    /// </summary>
    public int RetentionDays { get; set; } = 90;
}
