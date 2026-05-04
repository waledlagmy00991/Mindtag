using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Mindtag.API.Auth;
using Mindtag.API.Extensions;
using Mindtag.Core.DTOs.Session;
using Mindtag.Core.Enums;
using Mindtag.Core.Interfaces;
using Mindtag.Core.Settings;
using Mindtag.Infrastructure.Utils;

namespace Mindtag.API.Controllers;

[Authorize]
[ApiController]
[Route("sessions")]
public sealed class SessionsController : ControllerBase
{
    private readonly ISessionService _sessionService;
    private readonly ISessionRepository _sessionRepo;
    private readonly IRedisService _redisService;
    private readonly QrSecuritySettings _qrSecurity;

    public SessionsController(
        ISessionService sessionService,
        ISessionRepository sessionRepo,
        IRedisService redisService,
        IOptions<QrSecuritySettings> qrSecurity)
    {
        _sessionService = sessionService;
        _sessionRepo = sessionRepo;
        _redisService = redisService;
        _qrSecurity = qrSecurity.Value;
    }

    [AuthorizeRoles("Doctor")]
    [HttpPost]
    public async Task<IActionResult> StartSession([FromBody] StartSessionRequest request)
    {
        var doctorId = HttpContext.GetCurrentUserId();
        var initialPayload = await _sessionService.StartSessionAsync(doctorId, request);
        return Ok(new { success = true, data = initialPayload });
    }

    [AuthorizeRoles("Doctor", "Admin")]
    [HttpGet("{id}/qr")]
    public async Task<IActionResult> GetCurrentQr(Guid id)
    {
        var payloadJson = await _redisService.GetAsync($"qr:{id}");

        if (string.IsNullOrEmpty(payloadJson))
        {
            var session = await _sessionRepo.GetByIdAsync(id);
            if (session is null || session.Status != SessionStatus.Active)
            {
                return NotFound(new { success = false, message = "Session is not active or QR token expired." });
            }

            var iat = ((DateTimeOffset)session.QrExpiresAt.AddSeconds(-6)).ToUnixTimeSeconds();
            var exp = ((DateTimeOffset)session.QrExpiresAt).ToUnixTimeSeconds();

            payloadJson = QrGenerator.GenerateQrPayloadJson(
                session.Id,
                session.CurrentQrToken,
                session.Course.Code,
                session.Course.Doctor.FullName,
                session.Course.Schedules.FirstOrDefault()?.Room ?? "Unknown",
                iat,
                exp,
                _qrSecurity.HmacSecret);
        }

        return Content(payloadJson, "application/json");
    }

    [AuthorizeRoles("Doctor", "Admin")]
    [HttpPatch("{id}/end")]
    public async Task<IActionResult> EndSession(Guid id)
    {
        var doctorId = HttpContext.GetCurrentUserId();
        await _sessionService.EndSessionAsync(doctorId, id);
        return Ok(new { success = true, message = "Session ended successfully." });
    }

    // ─── Attendance Stub (M6) ──────────────────────────────────────────────────

    [AuthorizeRoles("Doctor", "Admin")]
    [HttpGet("{id}/attendance")]
    public IActionResult GetAttendance(Guid id)
    {
        // M6 Implementation stub
        return Ok(new { success = true, message = "Attendance data will be hooked up in M6." });
    }
}
