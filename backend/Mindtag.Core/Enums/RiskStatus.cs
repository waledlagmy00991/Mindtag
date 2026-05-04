namespace Mindtag.Core.Enums;

/// <summary>
/// Risk status for a student's enrollment in a course, based on attendance percentage.
/// Safe ≥ 75% | Warning 60–74% | Danger &lt; 60%.
/// </summary>
public enum RiskStatus
{
    /// <summary>Attendance ≥ 75% — student is in good standing.</summary>
    Safe,

    /// <summary>Attendance 60–74% — student should be cautious.</summary>
    Warning,

    /// <summary>Attendance &lt; 60% — student is at risk of failing.</summary>
    Danger
}
