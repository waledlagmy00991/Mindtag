namespace Mindtag.Core.Enums;

/// <summary>
/// Defines the roles available in the Mindtag system.
/// </summary>
public enum UserRole
{
    /// <summary>Student user — scans QR, views schedule and attendance.</summary>
    Student,

    /// <summary>Doctor/Professor — starts sessions, displays QR, manages courses.</summary>
    Doctor,

    /// <summary>Administrator — manages users, courses, and system settings.</summary>
    Admin
}
