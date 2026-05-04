using Microsoft.EntityFrameworkCore;
using Mindtag.Core.DTOs.Schedule;
using Mindtag.Core.Entities;
using Mindtag.Core.Enums;
using Mindtag.Core.Exceptions;
using Mindtag.Core.Interfaces;
using Mindtag.Infrastructure.Data;
using DayOfWeek = Mindtag.Core.Enums.DayOfWeek;

namespace Mindtag.Infrastructure.Services;

public sealed class ScheduleService : IScheduleService
{
    private readonly IScheduleRepository _scheduleRepo;
    private readonly ISessionRepository _sessionRepo;
    private readonly AppDbContext _db;

    public ScheduleService(IScheduleRepository scheduleRepo, ISessionRepository sessionRepo, AppDbContext db)
    {
        _scheduleRepo = scheduleRepo;
        _sessionRepo = sessionRepo;
        _db = db;
    }

    public async Task<Dictionary<string, List<ScheduleSlotDTO>>> GetWeeklyAsync(Guid studentId)
    {
        var slots = await _scheduleRepo.GetByStudentIdAsync(studentId);
        var grouped = new Dictionary<string, List<ScheduleSlotDTO>>();

        foreach (DayOfWeek day in Enum.GetValues<DayOfWeek>())
        {
            grouped[day.ToString()] = slots
                .Where(s => s.DayOfWeek == day)
                .Select(MapToDto)
                .ToList();
        }

        return grouped;
    }

    public async Task<List<ScheduleSlotDTO>> GetTodayAsync(Guid studentId)
    {
        var today = GetCurrentDayOfWeek();
        var slots = await _scheduleRepo.GetByStudentAndDayAsync(studentId, today);
        return slots.Select(MapToDto).ToList();
    }

    public async Task<NextLectureDTO?> GetNextLectureAsync(Guid studentId)
    {
        var today = GetCurrentDayOfWeek();
        var now = DateTime.UtcNow.TimeOfDay;

        var todaySlots = await _scheduleRepo.GetByStudentAndDayAsync(studentId, today);
        var nextSlot = todaySlots.FirstOrDefault(s => s.StartTime > now);
        
        if (nextSlot is null) return null;

        var minutesUntil = (int)(nextSlot.StartTime - now).TotalMinutes;
        if (minutesUntil < 0) minutesUntil = 0;

        // Check if there's an active session for this course
        bool hasActiveSession = false;
        if (nextSlot.CourseId.HasValue)
        {
            var activeSession = await _sessionRepo.GetActiveSessionByCourseAsync(nextSlot.CourseId.Value);
            hasActiveSession = activeSession is not null;
        }

        return new NextLectureDTO(
            nextSlot.CourseId,
            nextSlot.SubjectName,
            nextSlot.StartTime.ToString(@"hh\:mm"),
            nextSlot.EndTime.ToString(@"hh\:mm"),
            nextSlot.Location,
            nextSlot.InstructorName,
            minutesUntil,
            hasActiveSession);
    }

    public async Task<ScheduleSlotDTO> CreateSlotAsync(Guid studentId, CreateSlotRequest request)
    {
        var start = TimeSpan.Parse(request.StartTime);
        var end = TimeSpan.Parse(request.EndTime);

        if (end <= start)
            throw new AppException("VALIDATION_ERROR", "End time must be after start time.");

        if (await _scheduleRepo.HasOverlapAsync(studentId, request.DayOfWeek, start, end))
            throw new AppException("DUPLICATE_SCHEDULE_SLOT", "This time slot overlaps with an existing lecture.");

        var slot = new StudentScheduleSlot
        {
            Id = Guid.NewGuid(),
            StudentId = studentId,
            SubjectName = request.SubjectName,
            DayOfWeek = request.DayOfWeek,
            StartTime = start,
            EndTime = end,
            Location = request.Location,
            InstructorName = request.InstructorName,
            CourseId = request.CourseId,
            CreatedAt = DateTime.UtcNow
        };

        await _scheduleRepo.CreateAsync(slot);
        return MapToDto(slot);
    }

    public async Task<ScheduleSlotDTO> UpdateSlotAsync(Guid studentId, Guid slotId, UpdateSlotRequest request)
    {
        var slot = await _scheduleRepo.GetByIdAsync(slotId)
            ?? throw new AppException("NOT_FOUND", "Schedule slot not found.");

        if (slot.StudentId != studentId)
            throw new AppException("FORBIDDEN", "You do not own this schedule slot.");

        if (request.SubjectName is not null) slot.SubjectName = request.SubjectName;
        if (request.Location is not null) slot.Location = request.Location;
        if (request.InstructorName is not null) slot.InstructorName = request.InstructorName;

        if (request.StartTime is not null || request.EndTime is not null)
        {
            var newStart = request.StartTime is not null ? TimeSpan.Parse(request.StartTime) : slot.StartTime;
            var newEnd = request.EndTime is not null ? TimeSpan.Parse(request.EndTime) : slot.EndTime;

            if (newEnd <= newStart)
                throw new AppException("VALIDATION_ERROR", "End time must be after start time.");

            if (await _scheduleRepo.HasOverlapAsync(studentId, slot.DayOfWeek, newStart, newEnd, slotId))
                throw new AppException("DUPLICATE_SCHEDULE_SLOT", "This time slot overlaps with an existing lecture.");

            slot.StartTime = newStart;
            slot.EndTime = newEnd;
        }

        await _scheduleRepo.UpdateAsync(slot);
        return MapToDto(slot);
    }

    public async Task DeleteSlotAsync(Guid studentId, Guid slotId)
    {
        var slot = await _scheduleRepo.GetByIdAsync(slotId)
            ?? throw new AppException("NOT_FOUND", "Schedule slot not found.");

        if (slot.StudentId != studentId)
            throw new AppException("FORBIDDEN", "You do not own this schedule slot.");

        await _scheduleRepo.DeleteAsync(slotId);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private static ScheduleSlotDTO MapToDto(StudentScheduleSlot s) => new(
        s.Id, s.SubjectName, s.DayOfWeek,
        s.StartTime.ToString(@"hh\:mm"),
        s.EndTime.ToString(@"hh\:mm"),
        s.Location, s.InstructorName, s.CourseId);

    private static DayOfWeek GetCurrentDayOfWeek()
    {
        return DateTime.UtcNow.DayOfWeek switch
        {
            System.DayOfWeek.Monday => DayOfWeek.Monday,
            System.DayOfWeek.Tuesday => DayOfWeek.Tuesday,
            System.DayOfWeek.Wednesday => DayOfWeek.Wednesday,
            System.DayOfWeek.Thursday => DayOfWeek.Thursday,
            System.DayOfWeek.Friday => DayOfWeek.Friday,
            System.DayOfWeek.Saturday => DayOfWeek.Saturday,
            System.DayOfWeek.Sunday => DayOfWeek.Sunday,
            _ => DayOfWeek.Monday
        };
    }
}
