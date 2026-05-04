namespace Mindtag.Core.Enums;

/// <summary>
/// Actions tracked in the audit log system (PRD §14.9).
/// </summary>
public enum AuditAction
{
    // ─── Auth ──────────────────────────────────────────────
    /// <summary>User logged in successfully.</summary>
    LoginSuccess,

    /// <summary>Login attempt failed (wrong credentials).</summary>
    LoginFailure,

    /// <summary>Login attempted from a device not matching the active binding.</summary>
    LoginFromUnknownDevice,

    /// <summary>Account locked due to excessive failed login attempts.</summary>
    AccountLocked,

    /// <summary>User changed their password.</summary>
    PasswordChanged,

    /// <summary>Device binding was reset via email confirmation.</summary>
    DeviceReset,

    /// <summary>New user account was created during registration.</summary>
    UserCreated,

    // ─── Attendance ────────────────────────────────────────
    /// <summary>Student successfully scanned attendance QR code.</summary>
    AttendanceScan,

    /// <summary>Attendance scan was rejected (with error code in metadata).</summary>
    AttendanceScanRejected,

    /// <summary>Doctor manually overrode an attendance record status.</summary>
    AttendanceManualOverride,

    /// <summary>Doctor manually added an attendance record for a student.</summary>
    AttendanceManualAdd,

    // ─── Session ───────────────────────────────────────────
    /// <summary>Doctor started a new lecture session.</summary>
    SessionStarted,

    /// <summary>Doctor manually ended a session.</summary>
    SessionEnded,

    /// <summary>Session was auto-ended by the Hangfire background job.</summary>
    SessionAutoEnded,

    // ─── Admin ─────────────────────────────────────────────
    /// <summary>Admin deactivated a user account.</summary>
    UserDeactivated,

    /// <summary>A new course was created.</summary>
    CourseCreated,

    /// <summary>A course was soft-deleted.</summary>
    CourseDeleted,

    /// <summary>A student was enrolled in a course.</summary>
    StudentEnrolled,

    /// <summary>A student was unenrolled from a course.</summary>
    StudentUnenrolled,


    /// <summary>Admin performed a write action on a user.</summary>
    AdminActionOnUser,

    // ─── Security ──────────────────────────────────────────
    /// <summary>Suspicious activity detected (speed anomaly, mock GPS).</summary>
    SuspiciousActivity,

    /// <summary>User-level rate limit was exceeded.</summary>
    RateLimitHit
}
