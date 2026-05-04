using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Mindtag.Core.Enums;
using Mindtag.Core.Interfaces;
using Mindtag.Infrastructure.Data;

namespace Mindtag.Infrastructure.Jobs;

/// <summary>
/// Background job that forcefully ends sessions left open for more than 3 hours (PRD §14.5.1).
/// Designed to run every 5 minutes.
/// </summary>
public sealed class SessionAutoEndJob
{
    private readonly AppDbContext _db;
    private readonly IAuditLogService _audit;
    private readonly ILogger<SessionAutoEndJob> _logger;

    public SessionAutoEndJob(AppDbContext db, IAuditLogService audit, ILogger<SessionAutoEndJob> logger)
    {
        _db = db;
        _audit = audit;
        _logger = logger;
    }

    public async Task ExecuteAsync()
    {
        _logger.LogInformation("Running SessionAutoEndJob at {Time}", DateTime.UtcNow);

        var cutoffTime = DateTime.UtcNow.AddHours(-3);

        var expiredSessions = await _db.Sessions
            .Where(s => s.Status == SessionStatus.Active && s.StartedAt < cutoffTime)
            .ToListAsync();

        if (expiredSessions.Count == 0)
            return;

        foreach (var session in expiredSessions)
        {
            session.Status = SessionStatus.Ended;
            session.EndedAt = DateTime.UtcNow;

            await _audit.LogAsync(null, AuditAction.SessionAutoEnded, session.Id.ToString(), "Auto-ended by Hangfire due to 3 hour limit.");
        }

        await _db.SaveChangesAsync();
        _logger.LogInformation("Auto-ended {Count} expired sessions.", expiredSessions.Count);
    }
}
