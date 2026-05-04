using Mindtag.Core.Entities;

namespace Mindtag.Core.Interfaces;

/// <summary>
/// Data access for lecture Sessions.
/// </summary>
public interface ISessionRepository
{
    Task<Session?> GetByIdAsync(Guid id);
    
    /// <summary>Fetch all active sessions across the entire system (used by QR Rotation Job).</summary>
    Task<IReadOnlyCollection<Session>> GetActiveSessionsAsync();
    
    /// <summary>Find if a course currently has an active session (prevents duplicates).</summary>
    Task<Session?> GetActiveSessionByCourseAsync(Guid courseId);
    
    Task<Session> CreateAsync(Session session);
    
    /// <summary>Optimized token update for background rotation jobs.</summary>
    Task UpdateQrTokenAsync(Guid sessionId, string newToken, DateTime expiresAt);
    
    Task IncrementPresentCountAsync(Guid sessionId);
    
    Task EndSessionAsync(Guid sessionId);
    
    Task<(IReadOnlyCollection<Session> items, int total)> GetByCourseAsync(Guid courseId, int page, int limit);
}
