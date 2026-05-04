using Mindtag.Core.Entities;

namespace Mindtag.Core.Interfaces;

public interface INotificationRepository
{
    Task<Notification?> GetByIdAsync(Guid id);
    Task<Notification> CreateAsync(Notification notification);
    Task<(IReadOnlyCollection<Notification> items, int total)> GetByUserIdAsync(Guid userId, int page, int limit);
    Task<int> MarkAllAsReadAsync(Guid userId);
    Task MarkAsReadAsync(Guid id);
    Task DeleteAsync(Guid id);
}
