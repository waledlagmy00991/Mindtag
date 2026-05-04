using Microsoft.EntityFrameworkCore;
using Mindtag.Core.Entities;
using Mindtag.Core.Enums;
using Mindtag.Core.Interfaces;
using Mindtag.Infrastructure.Data;

namespace Mindtag.Infrastructure.Repositories;

public sealed class AttendanceRepository : IAttendanceRepository
{
    private readonly AppDbContext _db;

    public AttendanceRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<bool> ExistsAsync(Guid sessionId, Guid studentId)
    {
        return await _db.AttendanceRecords
            .AnyAsync(a => a.SessionId == sessionId && a.StudentId == studentId);
    }

    public async Task<AttendanceRecord> CreateAsync(AttendanceRecord record)
    {
        _db.AttendanceRecords.Add(record);
        await _db.SaveChangesAsync();
        return record;
    }

    public async Task UpdateAsync(AttendanceRecord record)
    {
        _db.AttendanceRecords.Update(record);
        await _db.SaveChangesAsync();
    }

    public async Task<AttendanceRecord?> GetByIdAsync(Guid id)
    {
        return await _db.AttendanceRecords
            .Include(a => a.Session)
                .ThenInclude(s => s.Course)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<IReadOnlyCollection<AttendanceRecord>> GetBySessionAsync(Guid sessionId)
    {
        return await _db.AttendanceRecords
            .Include(a => a.Student) // Needs student name
            .Where(a => a.SessionId == sessionId)
            .OrderByDescending(a => a.ScannedAt)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<(IReadOnlyCollection<AttendanceRecord> items, int total)> GetByStudentAsync(Guid studentId, Guid? courseId, int page, int limit)
    {
        var query = _db.AttendanceRecords
            .Include(a => a.Session)
                .ThenInclude(s => s.Course)
                    .ThenInclude(c => c.Doctor)
            .Where(a => a.StudentId == studentId);

        if (courseId.HasValue && courseId.Value != Guid.Empty)
        {
            query = query.Where(a => a.Session.CourseId == courseId.Value);
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(a => a.ScannedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .AsNoTracking()
            .ToListAsync();

        return (items, total);
    }

    public async Task<AttendanceRecord?> GetLastRecordTodayAsync(Guid studentId)
    {
        var todayStart = DateTime.UtcNow.Date; // 00:00:00 today

        return await _db.AttendanceRecords
            .Include(a => a.Session)
            .Where(a => a.StudentId == studentId && a.ScannedAt >= todayStart)
            .OrderByDescending(a => a.ScannedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<IReadOnlyCollection<Enrollment>> GetStudentEnrollmentsWithHistoryAsync(Guid studentId)
    {
        return await _db.Enrollments
            .Include(e => e.Course)
                .ThenInclude(c => c.Sessions.Where(s => s.Status == SessionStatus.Ended))
                    .ThenInclude(s => s.AttendanceRecords.Where(a => a.StudentId == studentId))
            .Where(e => e.StudentId == studentId)
            .AsNoTracking()
            .ToListAsync();
    }
}
