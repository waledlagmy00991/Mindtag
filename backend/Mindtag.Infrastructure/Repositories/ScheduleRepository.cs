using Microsoft.EntityFrameworkCore;
using Mindtag.Core.Entities;
using Mindtag.Core.Interfaces;
using Mindtag.Infrastructure.Data;
using DayOfWeek = Mindtag.Core.Enums.DayOfWeek;

namespace Mindtag.Infrastructure.Repositories;

public sealed class ScheduleRepository : IScheduleRepository
{
    private readonly AppDbContext _db;

    public ScheduleRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyCollection<StudentScheduleSlot>> GetByStudentIdAsync(Guid studentId)
    {
        return await _db.StudentScheduleSlots
            .Where(s => s.StudentId == studentId)
            .OrderBy(s => s.DayOfWeek)
            .ThenBy(s => s.StartTime)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<IReadOnlyCollection<StudentScheduleSlot>> GetByStudentAndDayAsync(Guid studentId, DayOfWeek day)
    {
        return await _db.StudentScheduleSlots
            .Where(s => s.StudentId == studentId && s.DayOfWeek == day)
            .OrderBy(s => s.StartTime)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<StudentScheduleSlot?> GetByIdAsync(Guid id)
    {
        return await _db.StudentScheduleSlots.FindAsync(id);
    }

    public async Task<StudentScheduleSlot> CreateAsync(StudentScheduleSlot slot)
    {
        _db.StudentScheduleSlots.Add(slot);
        await _db.SaveChangesAsync();
        return slot;
    }

    public async Task UpdateAsync(StudentScheduleSlot slot)
    {
        _db.StudentScheduleSlots.Update(slot);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var slot = await _db.StudentScheduleSlots.FindAsync(id);
        if (slot is not null)
        {
            _db.StudentScheduleSlots.Remove(slot);
            await _db.SaveChangesAsync();
        }
    }

    public async Task<bool> HasOverlapAsync(Guid studentId, DayOfWeek day, TimeSpan start, TimeSpan end, Guid? excludeId = null)
    {
        var query = _db.StudentScheduleSlots
            .Where(s => s.StudentId == studentId && s.DayOfWeek == day);

        if (excludeId.HasValue)
            query = query.Where(s => s.Id != excludeId.Value);

        // Overlap: existing.Start < newEnd AND existing.End > newStart
        return await query.AnyAsync(s => s.StartTime < end && s.EndTime > start);
    }
}
