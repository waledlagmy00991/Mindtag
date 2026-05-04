using Microsoft.AspNetCore.SignalR;
using Mindtag.API.Hubs;
using Mindtag.Core.Interfaces;

namespace Mindtag.API.Services;

public sealed class WebSocketNotifier : IWebSocketNotifier
{
    private readonly IHubContext<SessionHub> _sessionHub;
    private readonly IHubContext<StudentHub> _studentHub;

    public WebSocketNotifier(IHubContext<SessionHub> sessionHub, IHubContext<StudentHub> studentHub)
    {
        _sessionHub = sessionHub;
        _studentHub = studentHub;
    }

    public async Task SendToGroupAsync(string groupName, string method, object? data = null)
    {
        if (data is null)
            await _sessionHub.Clients.Group(groupName).SendAsync(method);
        else
            await _sessionHub.Clients.Group(groupName).SendAsync(method, data);
    }

    public async Task SendToUserAsync(string userId, string method, object? data = null)
    {
        if (data is null)
            await _studentHub.Clients.User(userId).SendAsync(method);
        else
            await _studentHub.Clients.User(userId).SendAsync(method, data);
    }
}
