using Microsoft.EntityFrameworkCore;
using Mindtag.Core.Entities;
using Mindtag.Core.Interfaces;
using Mindtag.Infrastructure.Data;

namespace Mindtag.Infrastructure.Repositories;

public sealed class AnnouncementRepository : IAnnouncementRepository
{
    private readonly AppDbContext _db;

    public AnnouncementRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Announcement> CreateAsync(Announcement announcement)
    {
        _db.Announcements.Add(announcement);
        await _db.SaveChangesAsync();
        return announcement;
    }

    public async Task<(IReadOnlyCollection<Announcement> items, int total)> GetAsync(Guid? courseId, int page, int limit)
    {
        var query = _db.Announcements
            .Include(a => a.Course)
            .Include(a => a.Author)
            .AsQueryable();

        if (courseId.HasValue)
            query = query.Where(a => a.CourseId == courseId.Value);

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .AsNoTracking()
            .ToListAsync();

        return (items, total);
    }
}
