namespace Mindtag.Core.Enums;

/// <summary>
/// Represents the attendance status for a student in a session.
/// </summary>
public enum AttendanceStatus
{
    /// <summary>Student checked in within the first 15 minutes.</summary>
    Present,

    /// <summary>Student checked in after 15 minutes but within the attendance window.</summary>
    Late,

    /// <summary>Student did not check in or was marked absent by the doctor.</summary>
    Absent
}
