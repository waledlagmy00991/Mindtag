using Mindtag.Core.Enums;

namespace Mindtag.Core.DTOs.Attendance;

// ─── Requests ──────────────────────────────────────────────────────────────

public sealed record ScanAttendanceRequest(
    string QrToken,
    Guid SessionId,
    double StudentLat,
    double StudentLng,
    double Accuracy,
    bool IsMockLocation);

public sealed record OverrideAttendanceRequest(
    AttendanceStatus Status,
    string Reason);

public sealed record ManualAttendanceRequest(
    Guid StudentId,
    AttendanceStatus Status,
    string Reason);

// ─── Responses ─────────────────────────────────────────────────────────────

public sealed record AttendanceRecordDTO(
    Guid Id,
    AttendanceStatus Status,
    DateTime ScannedAt,
    double? Distance,
    string CourseName,
    string ProfessorName,
    bool IsSuspicious);

public sealed record AttendanceSummaryItemDTO(
    Guid CourseId,
    string CourseCode,
    string CourseName,
    int TotalSessions,
    int Attended,
    int Missed,
    double Percentage,
    int AbsenceLimit,
    int AbsenceUsed,
    string Status); // "Safe", "Warning", "Danger"
