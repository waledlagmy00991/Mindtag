using FirebaseAdmin.Messaging;
using Hangfire;
using Microsoft.Extensions.Logging;
using Mindtag.Core.Interfaces;

namespace Mindtag.Infrastructure.Jobs;

/// <summary>
/// Handles transient FCM HTTP failures using an Exponential Backoff strategy running deeply in Hangfire.
/// </summary>
public sealed class FcmRetryJob
{
    private readonly IUserRepository _userRepo;
    private readonly ILogger<FcmRetryJob> _logger;

    public FcmRetryJob(IUserRepository userRepo, ILogger<FcmRetryJob> logger)
    {
        _userRepo = userRepo;
        _logger = logger;
    }

    public async Task RetryAsync(string fcmToken, string title, string body, Dictionary<string, string>? data, int attempt)
    {
        // Hard fail after 3 retries (total failure timeline: +2m, +4m, +8m)
        if (attempt > 3)
        {
            _logger.LogError($"FCM push permanently failed after 3 re-attempts for token {fcmToken}. Dropping payload.");
            return;
        }

        try
        {
            var message = new Message
            {
                Token = fcmToken,
                Notification = new Notification
                {
                    Title = title,
                    Body = body
                },
                Data = data ?? new Dictionary<string, string>()
            };

            await FirebaseMessaging.DefaultInstance.SendAsync(message);
        }
        catch (FirebaseMessagingException ex) when (ex.MessagingErrorCode == MessagingErrorCode.Unregistered)
        {
            _logger.LogWarning($"FCM token {fcmToken} unregistered during delayed retry attempt {attempt}. Purging.");
            await _userRepo.ClearFcmTokenAsync(fcmToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"FCM retry {attempt} failed for {fcmToken}. Scheduling next backoff step.");
            
            // Exponential backoff
            var delay = TimeSpan.FromMinutes(Math.Pow(2, attempt)); 
            BackgroundJob.Schedule<FcmRetryJob>(job => job.RetryAsync(fcmToken, title, body, data, attempt + 1), delay);
        }
    }
}
