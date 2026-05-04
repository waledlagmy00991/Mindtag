using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Mindtag.API.Auth;
using Mindtag.API.Extensions;
using Mindtag.Core.Enums;
using Mindtag.Core.Interfaces;

namespace Mindtag.API.Hubs;

/// <summary>
/// Real-time WebSocket hub for active sessions (Doctor Dashboard).
/// Allows the backend to push QR updates and newly scanned attendances to the frontend.
/// </summary>
[AuthorizeRoles("Doctor")]
public sealed class SessionHub : Hub
{
    private readonly ISessionRepository _sessionRepo;
    private readonly ISessionService _sessionService;

    public SessionHub(ISessionRepository sessionRepo, ISessionService sessionService)
    {
        _sessionRepo = sessionRepo;
        _sessionService = sessionService;
    }

    /// <summary>
    /// Joins the session's broadcast group if the caller actually owns the session.
    /// </summary>
    public async Task JoinSession(Guid sessionId)
    {
        var session = await _sessionRepo.GetByIdAsync(sessionId);
        
        if (session is null)
        {
            throw new HubException("Session not found.");
        }

        var doctorId = Guid.Parse(Context.User!.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

        if (session.Course.DoctorId != doctorId)
        {
            throw new HubException("Unauthorized: You do not own this session.");
        }

        if (session.Status != SessionStatus.Active)
        {
            throw new HubException("Session is not active.");
        }

        var groupName = $"session:{sessionId}";
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
    }

    /// <summary>
    /// Allows the doctor to end the session directly via WebSockets.
    /// </summary>
    public async Task EndSession(Guid sessionId)
    {
        var session = await _sessionRepo.GetByIdAsync(sessionId);
        var doctorId = Guid.Parse(Context.User!.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

        if (session is null || session.Course.DoctorId != doctorId)
        {
            throw new HubException("Unauthorized: You do not own this session.");
        }

        await _sessionService.EndSessionAsync(doctorId, sessionId);
    }
}
