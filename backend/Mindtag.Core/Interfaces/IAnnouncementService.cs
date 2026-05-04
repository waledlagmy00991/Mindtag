using Mindtag.Core.DTOs.Announcement;

namespace Mindtag.Core.Interfaces;

public interface IAnnouncementService
{
    Task<AnnouncementDTO> CreateAndNotifyAsync(Guid authorId, CreateAnnouncementRequest request);
    Task<(IReadOnlyCollection<AnnouncementDTO> items, int total)> GetAsync(Guid? courseId, int page, int limit);
}
