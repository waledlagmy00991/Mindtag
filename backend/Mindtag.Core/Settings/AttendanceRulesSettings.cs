namespace Mindtag.Core.Settings;

/// <summary>
/// Strongly-typed configuration for attendance business rules.
/// Bound to the "AttendanceRules" section of appsettings.json.
/// </summary>
public sealed class AttendanceRulesSettings
{
    /// <summary>
    /// Section name in appsettings.json.
    /// </summary>
    public static readonly string SectionName = "AttendanceRules";

    /// <summary>
    /// Maximum allowed distance (in meters) between student and session location. Default: 400.
    /// </summary>
    public int MaxDistanceMeters { get; set; } = 400;

    /// <summary>
    /// Maximum acceptable GPS accuracy (in meters). Scans with higher values are rejected. Default: 50.
    /// </summary>
    public int MaxGpsAccuracyMeters { get; set; } = 50;

    /// <summary>
    /// Minutes after session start before attendance is marked as Late. Default: 15.
    /// </summary>
    public int LateThresholdMinutes { get; set; } = 15;

    /// <summary>
    /// Minutes after session start when attendance window closes. Default: 30.
    /// </summary>
    public int AttendanceClosedMinutes { get; set; } = 30;

    /// <summary>
    /// Hours after which a session is automatically ended by the background job. Default: 3.
    /// </summary>
    public int SessionAutoEndHours { get; set; } = 3;

    /// <summary>
    /// Default absence limit per course when not overridden by the doctor. Default: 5.
    /// </summary>
    public int DefaultAbsenceLimit { get; set; } = 5;
}
