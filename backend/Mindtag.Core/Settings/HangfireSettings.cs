namespace Mindtag.Core.Settings;

/// <summary>
/// Strongly-typed configuration for Hangfire background job processing.
/// Bound to the "Hangfire" section of appsettings.json.
/// </summary>
public sealed class HangfireSettings
{
    /// <summary>
    /// Section name in appsettings.json.
    /// </summary>
    public static readonly string SectionName = "Hangfire";

    /// <summary>
    /// URL path where the Hangfire dashboard is mounted. Default: "/hangfire".
    /// </summary>
    public string DashboardPath { get; set; } = "/hangfire";

    /// <summary>
    /// Whether the Hangfire dashboard requires authentication. Default: true.
    /// </summary>
    public bool DashboardAuthRequired { get; set; } = true;
}
