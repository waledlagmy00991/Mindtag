using Microsoft.Extensions.Options;
using Mindtag.Core.DTOs.Session;
using Mindtag.Core.Entities;
using Mindtag.Core.Enums;
using Mindtag.Core.Exceptions;
using Mindtag.Core.Interfaces;
using Mindtag.Core.Settings;
using Mindtag.Infrastructure.Utils;

namespace Mindtag.Infrastructure.Services;

public sealed class SessionService : ISessionService
{
    private readonly ISessionRepository _sessionRepo;
    private readonly ICourseRepository _courseRepo;
    private readonly IRedisService _redisService;
    private readonly IWebSocketNotifier _notifier;
    private readonly IAuditLogService _audit;
    private readonly QrSecuritySettings _qrSecurity;

    public SessionService(
        ISessionRepository sessionRepo,
        ICourseRepository courseRepo,
        IRedisService redisService,
        IWebSocketNotifier notifier,
        IAuditLogService audit,
        IOptions<QrSecuritySettings> qrSecurity)
    {
        _sessionRepo = sessionRepo;
        _courseRepo = courseRepo;
        _redisService = redisService;
        _notifier = notifier;
        _audit = audit;
        _qrSecurity = qrSecurity.Value;
    }

    // ─── M5-T3: START SESSION ──────────────────────────────────────────────────

    public async Task<string> StartSessionAsync(Guid doctorId, StartSessionRequest request)
    {
        var course = await _courseRepo.GetByIdAsync(request.CourseId)
            ?? throw new AppException("NOT_FOUND", "Course not found.");

        if (course.DoctorId != doctorId)
            throw new AppException("FORBIDDEN", "Only the assigned doctor can start a session for this course.");

        var existingSession = await _sessionRepo.GetActiveSessionByCourseAsync(course.Id);
        if (existingSession is not null)
            throw new AppException("VALIDATION_ERROR", "An active session already exists for this course.");

        // Create new session entity
        var token = QrGenerator.GenerateCryptoToken();
        var now = DateTime.UtcNow;
        var expiresAt = now.AddSeconds(6);

        var session = new Session
        {
            Id = Guid.NewGuid(),
            CourseId = course.Id,
            DoctorId = doctorId,
            Status = SessionStatus.Active,
            CurrentQrToken = token,
            QrExpiresAt = expiresAt,
            LocationLat = request.LocationLat,
            LocationLng = request.LocationLng,
            StartedAt = now
        };

        await _sessionRepo.CreateAsync(session);

        // Calculate HMAC signature for exactly PRD compliant payload
        var iat = ((DateTimeOffset)now).ToUnixTimeSeconds();
        var exp = ((DateTimeOffset)expiresAt).ToUnixTimeSeconds();
        
        var payloadJson = QrGenerator.GenerateQrPayloadJson(
            session.Id, 
            token, 
            course.Code, 
            course.Doctor.FullName, 
            course.Schedules.FirstOrDefault()?.Room ?? "Unknown", 
            iat, 
            exp, 
            _qrSecurity.HmacSecret);

        // Store active payload directly in MemoryCache for lightning fast retrieval
        await _redisService.SetAsync($"qr:{session.Id}", payloadJson, TimeSpan.FromSeconds(6));

        await _audit.LogAsync(doctorId, AuditAction.SessionStarted, session.Id.ToString());

        return payloadJson;
    }

    // ─── M5-T4: END SESSION ────────────────────────────────────────────────────

    public async Task EndSessionAsync(Guid doctorId, Guid sessionId)
    {
        var session = await _sessionRepo.GetByIdAsync(sessionId)
            ?? throw new AppException("NOT_FOUND", "Session not found.");

        if (session.Course.DoctorId != doctorId)
            throw new AppException("FORBIDDEN", "You do not have permission to end this session.");
            
        if (session.Status != SessionStatus.Active)
            throw new AppException("VALIDATION_ERROR", "Session is already ended.");

        await _sessionRepo.EndSessionAsync(sessionId);

        // Purge token from memory to ensure rotation jobs skip it
        await _redisService.DeleteAsync($"qr:{sessionId}");

        // Emit network event
        await _notifier.SendToGroupAsync($"session:{sessionId}", "SessionEnded");

        await _audit.LogAsync(doctorId, AuditAction.SessionEnded, session.Id.ToString());
    }
}
