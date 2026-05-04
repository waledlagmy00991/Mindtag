namespace Mindtag.Core.Interfaces;

/// <summary>
/// Abstracts SignalR context so the Infrastructure layer can push events without creating circular dependencies to Mindtag.API.
/// </summary>
public interface IWebSocketNotifier
{
    Task SendToGroupAsync(string groupName, string method, object? data = null);
    Task SendToUserAsync(string userId, string method, object? data = null);
}
