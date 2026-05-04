using System.Text.Json;
using Microsoft.Extensions.Logging;
using Mindtag.Core.DTOs.Notification;
using Mindtag.Core.Entities;
using Mindtag.Core.Enums;
using Mindtag.Core.Interfaces;

namespace Mindtag.Infrastructure.Services;

public sealed class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepo;
    private readonly IUserRepository _userRepo;
    private readonly IFcmService _fcmService;
    private readonly IWebSocketNotifier _notifier;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        INotificationRepository notificationRepo,
        IUserRepository userRepo,
        IFcmService fcmService,
        IWebSocketNotifier notifier,
        ILogger<NotificationService> logger)
    {
        _notificationRepo = notificationRepo;
        _userRepo = userRepo;
        _fcmService = fcmService;
        _notifier = notifier;
        _logger = logger;
    }

    public async Task<NotificationDTO> CreateAndSendAsync(
        Guid userId, 
        NotificationType type, 
        string title, 
        string body, 
        Dictionary<string, string>? dataDictionary = null, 
        DateTime? expiresAt = null)
    {
        string? dataJson = null;
        if (dataDictionary is not null && dataDictionary.Count > 0)
        {
            dataJson = JsonSerializer.Serialize(dataDictionary);
        }

        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = type,
            Title = title,
            Body = body,
            Data = dataJson,
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = expiresAt ?? DateTime.UtcNow.AddDays(7)
        };

        // 1. Persistence
        await _notificationRepo.CreateAsync(notification);

        var dto = new NotificationDTO(notification.Id, type, title, body, dataJson, false, notification.CreatedAt);

        // 2. Real-time WebSockets Fan-out (to the specific user)
        // Since we didn't natively group students by their User ID in StudentHub, 
        // we can broadcast to the user ID directly if the Hub is wired, BUT SignalR automatically maps `Context.UserIdentifier` to clients!
        await _notifier.SendToUserAsync(userId.ToString(), "NewNotification", dto);

        // 3. FCM Push Payload
        var user = await _userRepo.GetByIdAsync(userId);
        if (user is not null && !string.IsNullOrWhiteSpace(user.FcmToken))
        {
            // Fully async hand-off without awaiting FCM's physical dispatch directly on this thread long-term
            _ = Task.Run(async () =>
            {
                try
                {
                    await _fcmService.SendAsync(user.FcmToken, title, body, dataDictionary);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Background FCM dispatch wrapper failed.");
                }
            });
        }

        return dto;
    }

    public async Task<(IReadOnlyCollection<NotificationDTO> items, int total)> GetMyHistoryAsync(Guid userId, int page, int limit)
    {
        var (items, total) = await _notificationRepo.GetByUserIdAsync(userId, page, limit);
        var dtos = items.Select(n => new NotificationDTO(n.Id, n.Type, n.Title, n.Body, n.Data, n.IsRead, n.CreatedAt)).ToList();
        return (dtos, total);
    }

    public async Task ReadAllAsync(Guid userId)
    {
        await _notificationRepo.MarkAllAsReadAsync(userId);
    }
}
