using FirebaseAdmin.Messaging;
using Hangfire;
using Microsoft.Extensions.Logging;
using Mindtag.Core.Interfaces;
using Mindtag.Infrastructure.Jobs;

namespace Mindtag.Infrastructure.Services;

public sealed class FcmService : IFcmService
{
    private readonly IUserRepository _userRepo;
    private readonly ILogger<FcmService> _logger;

    public FcmService(IUserRepository userRepo, ILogger<FcmService> logger)
    {
        _userRepo = userRepo;
        _logger = logger;
    }

    public async Task SendAsync(string fcmToken, string title, string body, Dictionary<string, string>? data = null)
    {
        // Don't waste compute on empty tokens
        if (string.IsNullOrWhiteSpace(fcmToken)) return;

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
            // PRD §14.5.2: Dead token stripping. Gracefully remove the token so we don't spam Google servers again.
            _logger.LogWarning($"FCM token {fcmToken} is unregistered. Stripping from database.");
            await _userRepo.ClearFcmTokenAsync(fcmToken);
        }
        catch (Exception ex)
        {
            // Network outage or 500 error from Firebase. Queue into Hangfire for resilient retry.
            _logger.LogError(ex, $"Failed to send FCM payload to {fcmToken}. Fanning out to FcmRetryJob.");
            BackgroundJob.Enqueue<FcmRetryJob>(job => job.RetryAsync(fcmToken, title, body, data, 1));
        }
    }
}
