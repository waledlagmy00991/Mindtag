using Mindtag.Core.Enums;

namespace Mindtag.Core.Entities;

/// <summary>
/// Represents an in-app and push notification sent to a user.
/// </summary>
public sealed class Notification
{
    /// <summary>Primary key.</summary>
    public Guid Id { get; set; }

    /// <summary>Foreign key to the recipient user.</summary>
    public Guid UserId { get; set; }

    /// <summary>Notification category.</summary>
    public NotificationType Type { get; set; }

    /// <summary>Notification title text.</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Notification body text.</summary>
    public string Body { get; set; } = string.Empty;

    /// <summary>Optional JSON payload with action-specific data (e.g., sessionId, courseId).</summary>
    public string? Data { get; set; }

    /// <summary>Whether the user has read this notification.</summary>
    public bool IsRead { get; set; } = false;

    /// <summary>When the notification becomes irrelevant and can be cleaned up (UTC).</summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>Creation timestamp (UTC).</summary>
    public DateTime CreatedAt { get; set; }

    // ─── Navigation Properties ─────────────────────────────────────────────

    /// <summary>The recipient user.</summary>
    public User User { get; set; } = null!;
}
