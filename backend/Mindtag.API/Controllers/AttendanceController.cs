using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mindtag.API.Auth;
using Mindtag.API.Extensions;
using Mindtag.Core.DTOs.Attendance;
using Mindtag.Core.Interfaces;
using System.Security.Claims;

namespace Mindtag.API.Controllers;

[ApiController]
[Route("attendance")]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _attendanceService;
    private readonly IAttendanceRepository _attendanceRepo;

    public AttendanceController(IAttendanceService attendanceService, IAttendanceRepository attendanceRepo)
    {
        _attendanceService = attendanceService;
        _attendanceRepo = attendanceRepo;
    }

    // ─── STUDENT ENDPOINTS ─────────────────────────────────────────────────────

    [HttpPost("scan")]
    [AuthorizeRoles("Student")]
    public async Task<IActionResult> ScanAttendance([FromBody] ScanAttendanceRequest request)
    {
        var studentId = HttpContext.GetCurrentUserId();
        var record = await _attendanceService.ScanAttendanceAsync(studentId, request);
        return CreatedAtAction(nameof(GetMyAttendance), new { }, new { data = record });
    }

    [HttpGet("me")]
    [AuthorizeRoles("Student")]
    public async Task<IActionResult> GetMyAttendance([FromQuery] Guid? courseId, [FromQuery] int page = 1, [FromQuery] int limit = 20)
    {
        var studentId = HttpContext.GetCurrentUserId();
        var (items, total) = await _attendanceRepo.GetByStudentAsync(studentId, courseId, page, limit);
        
        var dtoItems = items.Select(r => new AttendanceRecordDTO(
            r.Id, r.Status, r.ScannedAt, r.Distance, r.Session.Course.Name, r.Session.Course.Doctor.FullName, r.IsSuspicious
        ));

        return Ok(new { data = dtoItems, meta = new { total, page, limit } });
    }

    [HttpGet("me/summary")]
    [AuthorizeRoles("Student")]
    public async Task<IActionResult> GetMySummary()
    {
        var studentId = HttpContext.GetCurrentUserId();
        var summary = await _attendanceService.GetSummaryAsync(studentId);
        return Ok(new { data = summary });
    }

    // ─── DOCTOR ENDPOINTS ──────────────────────────────────────────────────────

    [HttpPatch("{id}/override")]
    [AuthorizeRoles("Doctor", "Admin")]
    public async Task<IActionResult> OverrideAttendance(Guid id, [FromBody] OverrideAttendanceRequest request)
    {
        var doctorId = HttpContext.GetCurrentUserId();
        await _attendanceService.OverrideAttendanceAsync(doctorId, id, request);
        return Ok(new { data = (object?)null });
    }

    [HttpPost("sessions/{sessionId}/attendance/manual")]
    [AuthorizeRoles("Doctor", "Admin")]
    public async Task<IActionResult> ManualAddAttendance(Guid sessionId, [FromBody] ManualAttendanceRequest request)
    {
        var doctorId = HttpContext.GetCurrentUserId();
        await _attendanceService.ManualAddAttendanceAsync(doctorId, sessionId, request);
        return Ok(new { data = (object?)null });
    }

    // ─── ADMIN ENDPOINTS ───────────────────────────────────────────────────────

    [HttpPost("toggle")]
    [AuthorizeRoles("Admin")]
    public async Task<IActionResult> AdminToggleAttendance([FromBody] AdminToggleAttendanceRequest request)
    {
        var adminId = HttpContext.GetCurrentUserId();
        await _attendanceService.AdminToggleAttendanceAsync(adminId, request);
        return Ok(new { success = true, message = "Attendance toggled successfully." });
    }
}
