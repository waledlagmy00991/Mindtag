namespace Mindtag.Core.Enums;

/// <summary>
/// Represents the lifecycle status of a lecture session.
/// </summary>
public enum SessionStatus
{
    /// <summary>Session is currently active and accepting attendance scans.</summary>
    Active,

    /// <summary>Session has been ended by the doctor or auto-ended by the system.</summary>
    Ended,

    /// <summary>Session was cancelled before completion.</summary>
    Cancelled
}
