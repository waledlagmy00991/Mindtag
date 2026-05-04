namespace Mindtag.Core.Enums;

/// <summary>
/// Days of the week for course schedules and student schedule slots.
/// Custom enum to ensure Monday = 0 ordering (differs from System.DayOfWeek where Sunday = 0).
/// </summary>
public enum DayOfWeek
{
    /// <summary>Monday.</summary>
    Monday,

    /// <summary>Tuesday.</summary>
    Tuesday,

    /// <summary>Wednesday.</summary>
    Wednesday,

    /// <summary>Thursday.</summary>
    Thursday,

    /// <summary>Friday.</summary>
    Friday,

    /// <summary>Saturday.</summary>
    Saturday,

    /// <summary>Sunday.</summary>
    Sunday
}
