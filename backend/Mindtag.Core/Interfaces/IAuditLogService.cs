using Mindtag.Core.Enums;

namespace Mindtag.Core.Interfaces;

/// <summary>
/// Service for writing immutable audit log entries. PRD §14.9.
/// </summary>
public interface IAuditLogService
{
    /// <summary>
    /// Log a security-relevant action.
    /// </summary>
    /// <param name="userId">Acting user ID (null for unauthenticated actions).</param>
    /// <param name="action">The audit action performed.</param>
    /// <param name="targetId">Optional target entity ID.</param>
    /// <param name="metadata">Optional JSON metadata.</param>
    /// <param name="isSuccess">Whether the action succeeded.</param>
    Task LogAsync(Guid? userId, AuditAction action, string? targetId = null,
        string? metadata = null, bool isSuccess = true);
}
