using Microsoft.EntityFrameworkCore;
using Mindtag.Core.Entities;
using Mindtag.Core.Enums;
using Mindtag.Core.Interfaces;
using Mindtag.Infrastructure.Data;

namespace Mindtag.Infrastructure.Repositories;

public sealed class SessionRepository : ISessionRepository
{
    private readonly AppDbContext _db;

    public SessionRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Session?> GetByIdAsync(Guid id)
    {
        return await _db.Sessions
            .Include(s => s.Course)
                .ThenInclude(c => c.Doctor)
            .Include(s => s.Course)
                .ThenInclude(c => c.Schedules)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<IReadOnlyCollection<Session>> GetActiveSessionsAsync()
    {
        return await _db.Sessions
            .Include(s => s.Course)
                .ThenInclude(c => c.Doctor)
            .Where(s => s.Status == SessionStatus.Active)
            .ToListAsync();
    }

    public async Task<Session?> GetActiveSessionByCourseAsync(Guid courseId)
    {
        return await _db.Sessions
            .FirstOrDefaultAsync(s => s.CourseId == courseId && s.Status == SessionStatus.Active);
    }

    public async Task<Session> CreateAsync(Session session)
    {
        _db.Sessions.Add(session);
        await _db.SaveChangesAsync();
        return session;
    }

    public async Task UpdateQrTokenAsync(Guid sessionId, string newToken, DateTime expiresAt)
    {
        var session = await _db.Sessions
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.Status == SessionStatus.Active);
        if (session is not null)
        {
            session.CurrentQrToken = newToken;
            session.QrExpiresAt = expiresAt;
            await _db.SaveChangesAsync();
        }
    }

    public async Task IncrementPresentCountAsync(Guid sessionId)
    {
        var session = await _db.Sessions.FindAsync(sessionId);
        if (session is not null)
        {
            session.TotalPresent += 1;
            await _db.SaveChangesAsync();
        }
    }

    public async Task EndSessionAsync(Guid sessionId)
    {
        var session = await _db.Sessions.FindAsync(sessionId);
        if (session is not null)
        {
            session.Status = SessionStatus.Ended;
            session.EndedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }

    public async Task<(IReadOnlyCollection<Session>, int)> GetByCourseAsync(Guid courseId, int page, int limit)
    {
        var query = _db.Sessions.Where(s => s.CourseId == courseId);
        
        var total = await query.CountAsync();
        
        var items = await query
            .OrderByDescending(s => s.StartedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .AsNoTracking()
            .ToListAsync();

        return (items, total);
    }
}
