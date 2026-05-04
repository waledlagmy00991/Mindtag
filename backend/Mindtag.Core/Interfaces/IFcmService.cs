namespace Mindtag.Core.Interfaces;

/// <summary>
/// Service wrapper for sending reliable push notifications via Firebase Cloud Messaging.
/// </summary>
public interface IFcmService
{
    Task SendAsync(string fcmToken, string title, string body, Dictionary<string, string>? data = null);
}
