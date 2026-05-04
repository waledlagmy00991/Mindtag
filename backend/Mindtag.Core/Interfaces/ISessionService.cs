using Mindtag.Core.DTOs.Session;

namespace Mindtag.Core.Interfaces;

/// <summary>
/// Handles starting and ending class sessions safely.
/// </summary>
public interface ISessionService
{
    Task<string> StartSessionAsync(Guid doctorId, StartSessionRequest request);
    Task EndSessionAsync(Guid doctorId, Guid sessionId);
}
