using Mindtag.Core.Entities;

namespace Mindtag.Core.Interfaces;

public interface IAnnouncementRepository
{
    Task<Announcement> CreateAsync(Announcement announcement);
    Task<(IReadOnlyCollection<Announcement> items, int total)> GetAsync(Guid? courseId, int page, int limit);
}
