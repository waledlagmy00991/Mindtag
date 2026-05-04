namespace Mindtag.Core.Enums;

/// <summary>
/// Defines the types of push/in-app notifications sent to users.
/// </summary>
public enum NotificationType
{
    /// <summary>Reminder sent 10 minutes before a scheduled lecture.</summary>
    LectureReminder,

    /// <summary>Nightly summary of tomorrow's schedule sent at 21:00.</summary>
    DailySchedule,

    /// <summary>Course or global announcement from a doctor/admin.</summary>
    Announcement,

    /// <summary>Attendance status update (e.g., risk threshold crossed).</summary>
    AttendanceUpdate
}
