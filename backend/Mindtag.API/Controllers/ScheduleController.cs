using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mindtag.API.Extensions;
using Mindtag.Core.DTOs.Schedule;
using Mindtag.Core.Interfaces;

namespace Mindtag.API.Controllers;

[Authorize]
[ApiController]
[Route("schedule")]
public sealed class ScheduleController : ControllerBase
{
    private readonly IScheduleService _scheduleService;

    public ScheduleController(IScheduleService scheduleService)
    {
        _scheduleService = scheduleService;
    }

    /// <summary>GET /schedule/me — full weekly timetable grouped by day</summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetWeekly()
    {
        var studentId = HttpContext.GetCurrentUserId();
        var data = await _scheduleService.GetWeeklyAsync(studentId);
        return Ok(new { success = true, data });
    }

    /// <summary>GET /schedule/today — today's lectures sorted by start time</summary>
    [HttpGet("today")]
    public async Task<IActionResult> GetToday()
    {
        var studentId = HttpContext.GetCurrentUserId();
        var data = await _scheduleService.GetTodayAsync(studentId);
        return Ok(new { success = true, data });
    }

    /// <summary>GET /schedule/next-lecture — the next upcoming lecture with active session check</summary>
    [HttpGet("next-lecture")]
    public async Task<IActionResult> GetNextLecture()
    {
        var studentId = HttpContext.GetCurrentUserId();
        var data = await _scheduleService.GetNextLectureAsync(studentId);
        return Ok(new { success = true, data });
    }

    /// <summary>POST /schedule/slots — create a new schedule slot</summary>
    [HttpPost("slots")]
    public async Task<IActionResult> CreateSlot([FromBody] CreateSlotRequest request)
    {
        var studentId = HttpContext.GetCurrentUserId();
        var data = await _scheduleService.CreateSlotAsync(studentId, request);
        return Created($"/schedule/slots/{data.Id}", new { success = true, data });
    }

    /// <summary>PATCH /schedule/slots/:id — update an existing slot</summary>
    [HttpPatch("slots/{id}")]
    public async Task<IActionResult> UpdateSlot(Guid id, [FromBody] UpdateSlotRequest request)
    {
        var studentId = HttpContext.GetCurrentUserId();
        var data = await _scheduleService.UpdateSlotAsync(studentId, id, request);
        return Ok(new { success = true, data });
    }

    /// <summary>DELETE /schedule/slots/:id — delete a schedule slot</summary>
    [HttpDelete("slots/{id}")]
    public async Task<IActionResult> DeleteSlot(Guid id)
    {
        var studentId = HttpContext.GetCurrentUserId();
        await _scheduleService.DeleteSlotAsync(studentId, id);
        return Ok(new { success = true, message = "Slot deleted." });
    }
}
