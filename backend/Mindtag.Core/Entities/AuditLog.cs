using Mindtag.Core.Enums;

namespace Mindtag.Core.Entities;

/// <summary>
/// Immutable audit trail entry for security-relevant actions. PRD §14.9.
/// Retained for 90 days, then cleaned up by Hangfire job.
/// </summary>
public sealed class AuditLog
{
    /// <summary>Primary key.</summary>
    public Guid Id { get; set; }

    /// <summary>Foreign key to the acting user. Null for unauthenticated actions.</summary>
    public Guid? UserId { get; set; }

    /// <summary>The action that was performed.</summary>
    public AuditAction Action { get; set; }

    /// <summary>Optional target entity ID (e.g., sessionId, courseId, target userId).</summary>
    public string? TargetId { get; set; }

    /// <summary>Client IP address at the time of the action.</summary>
    public string? IpAddress { get; set; }

    /// <summary>Client User-Agent header (truncated to 200 chars).</summary>
    public string? UserAgent { get; set; }

    /// <summary>JSON metadata with action-specific details.</summary>
    public string? Metadata { get; set; }

    /// <summary>Whether the action completed successfully.</summary>
    public bool IsSuccess { get; set; }

    /// <summary>Action timestamp (UTC).</summary>
    public DateTime CreatedAt { get; set; }

    // ─── Navigation Properties ─────────────────────────────────────────────

    /// <summary>The acting user (null for unauthenticated actions).</summary>
    public User? User { get; set; }
}
