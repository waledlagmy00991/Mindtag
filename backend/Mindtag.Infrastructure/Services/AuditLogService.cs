using Microsoft.AspNetCore.Http;
using Mindtag.Core.Entities;
using Mindtag.Core.Enums;
using Mindtag.Core.Interfaces;
using Mindtag.Infrastructure.Data;

namespace Mindtag.Infrastructure.Services;

/// <summary>
/// Writes immutable audit log entries per PRD §14.9.2.
/// Extracts IP and UserAgent from HttpContext.
/// </summary>
public sealed class AuditLogService : IAuditLogService
{
    private readonly AppDbContext _db;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuditLogService(AppDbContext db, IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _httpContextAccessor = httpContextAccessor;
    }

    /// <inheritdoc />
    public async Task LogAsync(Guid? userId, AuditAction action, string? targetId = null,
        string? metadata = null, bool isSuccess = true)
    {
        var context = _httpContextAccessor.HttpContext;

        var ipAddress = context?.Connection.RemoteIpAddress?.ToString();
        var userAgent = context?.Request.Headers["User-Agent"].ToString();
        if (userAgent?.Length > 200)
            userAgent = userAgent[..200];

        var entry = new AuditLog
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Action = action,
            TargetId = targetId,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            Metadata = metadata,
            IsSuccess = isSuccess,
            CreatedAt = DateTime.UtcNow
        };

        _db.AuditLogs.Add(entry);
        await _db.SaveChangesAsync();
    }
}
