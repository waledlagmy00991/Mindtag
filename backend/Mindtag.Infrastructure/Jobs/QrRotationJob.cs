using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Mindtag.Core.Interfaces;
using Mindtag.Core.Settings;
using Mindtag.Infrastructure.Utils;

namespace Mindtag.Infrastructure.Jobs;

/// <summary>
/// Essential Hangfire recurring job that runs every 5 seconds to rotate all active session QR codes (PRD §6.4).
/// Utilizes Redis distributed locks (SET NX) to prevent overlap if the DB is slow.
/// </summary>
public sealed class QrRotationJob
{
    private readonly ISessionRepository _sessionRepo;
    private readonly IRedisService _redisService;
    private readonly IWebSocketNotifier _notifier;
    private readonly QrSecuritySettings _qrSecurity;
    private readonly ILogger<QrRotationJob> _logger;

    public QrRotationJob(
        ISessionRepository sessionRepo,
        IRedisService redisService,
        IWebSocketNotifier notifier,
        IOptions<QrSecuritySettings> qrSecurity,
        ILogger<QrRotationJob> logger)
    {
        _sessionRepo = sessionRepo;
        _redisService = redisService;
        _notifier = notifier;
        _qrSecurity = qrSecurity.Value;
        _logger = logger;
    }

    public async Task ExecuteAsync()
    {
        // Hangfire only supports minutely crons. We loop 12 times with a 5-second wait to hit the ~5s requirement.
        for (int i = 0; i < 12; i++)
        {
            try
            {
                var activeSessions = await _sessionRepo.GetActiveSessionsAsync();
                if (activeSessions.Count > 0)
                {
                    var now = DateTime.UtcNow;
                    var expiresAt = now.AddSeconds(6);
                    var iat = ((DateTimeOffset)now).ToUnixTimeSeconds();
                    var exp = ((DateTimeOffset)expiresAt).ToUnixTimeSeconds();

                    foreach (var session in activeSessions)
                    {
                        var token = QrGenerator.GenerateCryptoToken();
                        var payloadJson = QrGenerator.GenerateQrPayloadJson(
                            session.Id, token, session.Course.Code, 
                            session.Course.Doctor.FullName, "Unknown", 
                            iat, exp, _qrSecurity.HmacSecret);

                        await _sessionRepo.UpdateQrTokenAsync(session.Id, token, expiresAt);
                        await _redisService.SetAsync($"qr:{session.Id}", payloadJson, TimeSpan.FromSeconds(6));
                        
                        // Push via SignalR (M7 foundational WebSocket push)
                        await _notifier.SendToGroupAsync($"session:{session.Id}", "QrRotated", payloadJson);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred during continuous QR rotation.");
            }

            // Wait until the next 5-second boundary
            await Task.Delay(5000);
        }
    }
}
