using Mindtag.Core.Enums;

namespace Mindtag.Core.DTOs.Notification;

public sealed record NotificationDTO(
    Guid Id,
    NotificationType Type,
    string Title,
    string Body,
    string? Data, // JSON payload string
    bool IsRead,
    DateTime CreatedAt);
