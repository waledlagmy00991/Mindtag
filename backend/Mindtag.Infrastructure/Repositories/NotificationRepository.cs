using Microsoft.EntityFrameworkCore;
using Mindtag.Core.Entities;
using Mindtag.Core.Interfaces;
using Mindtag.Infrastructure.Data;

namespace Mindtag.Infrastructure.Repositories;

public sealed class NotificationRepository : INotificationRepository
{
    private readonly AppDbContext _db;

    public NotificationRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Notification?> GetByIdAsync(Guid id)
    {
        return await _db.Notifications.FindAsync(id);
    }

    public async Task<Notification> CreateAsync(Notification notification)
    {
        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync();
        return notification;
    }

    public async Task<(IReadOnlyCollection<Notification> items, int total)> GetByUserIdAsync(Guid userId, int page, int limit)
    {
        var query = _db.Notifications.Where(n => n.UserId == userId);
        var total = await query.CountAsync();
        
        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .AsNoTracking()
            .ToListAsync();

        return (items, total);
    }

    public async Task<int> MarkAllAsReadAsync(Guid userId)
    {
        var unread = await _db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var n in unread)
            n.IsRead = true;

        await _db.SaveChangesAsync();
        return unread.Count;
    }

    public async Task MarkAsReadAsync(Guid id)
    {
        var notification = await _db.Notifications.FindAsync(id);
        if (notification is not null)
        {
            notification.IsRead = true;
            await _db.SaveChangesAsync();
        }
    }

    public async Task DeleteAsync(Guid id)
    {
        var notification = await _db.Notifications.FindAsync(id);
        if (notification is not null)
        {
            _db.Notifications.Remove(notification);
            await _db.SaveChangesAsync();
        }
    }
}
