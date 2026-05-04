using DayOfWeek = Mindtag.Core.Enums.DayOfWeek;

namespace Mindtag.Core.DTOs.Schedule;

public sealed record ScheduleSlotDTO(
    Guid Id,
    string SubjectName,
    DayOfWeek DayOfWeek,
    string StartTime,
    string EndTime,
    string? Location,
    string? InstructorName,
    Guid? CourseId);

public sealed record NextLectureDTO(
    Guid? CourseId,
    string SubjectName,
    string StartTime,
    string EndTime,
    string? Room,
    string? InstructorName,
    int MinutesUntilStart,
    bool HasActiveSession);

public sealed record CreateSlotRequest(
    string SubjectName,
    DayOfWeek DayOfWeek,
    string StartTime,
    string EndTime,
    string? Location,
    string? InstructorName,
    Guid? CourseId);

public sealed record UpdateSlotRequest(
    string? SubjectName,
    string? StartTime,
    string? EndTime,
    string? Location,
    string? InstructorName);
