using DayOfWeek = Mindtag.Core.Enums.DayOfWeek;

namespace Mindtag.Core.DTOs.Course;

// ─── Requests ──────────────────────────────────────────────────────────────

public sealed record CreateCourseRequest(
    string Code,
    string Name,
    string? Description,
    Guid? DoctorId,
    int CreditHours = 3,
    IReadOnlyCollection<CreateScheduleRequest>? Schedules = null);

public sealed record PatchCourseRequest(
    string? Name,
    string? Description,
    int? CreditHours,
    IReadOnlyCollection<CreateScheduleRequest>? Schedules = null);

public sealed record CreateScheduleRequest(
    DayOfWeek DayOfWeek,
    TimeSpan StartTime,
    TimeSpan EndTime,
    string Room);

// ─── Responses ─────────────────────────────────────────────────────────────

public sealed record CourseDoctorDTO(
    Guid Id,
    string FullName,
    string? Title);

public sealed record ScheduleSlotDTO(
    Guid Id,
    DayOfWeek DayOfWeek,
    TimeSpan StartTime,
    TimeSpan EndTime,
    string? Room);

public sealed record CourseDTO(
    Guid Id,
    string Code,
    string Name,
    string? Description,
    int CreditHours,
    bool IsActive,
    DateTime CreatedAt,
    CourseDoctorDTO Doctor,
    IReadOnlyCollection<ScheduleSlotDTO> Schedules);
