using Mindtag.Core.DTOs.Notification;
using Mindtag.Core.Enums;

namespace Mindtag.Core.Interfaces;

public interface INotificationService
{
    /// <summary>
    /// Executes the full real-time fan-out logic: Inserts into DB -> Blasts SignalR -> Pushes FCM payload.
    /// </summary>
    Task<NotificationDTO> CreateAndSendAsync(
        Guid userId, 
        NotificationType type, 
        string title, 
        string body, 
        Dictionary<string, string>? dataDictionary = null, 
        DateTime? expiresAt = null);
        
    Task<(IReadOnlyCollection<NotificationDTO> items, int total)> GetMyHistoryAsync(Guid userId, int page, int limit);
    Task ReadAllAsync(Guid userId);
}
