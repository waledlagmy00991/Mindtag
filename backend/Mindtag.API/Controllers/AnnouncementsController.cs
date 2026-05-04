using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mindtag.API.Auth;
using Mindtag.API.Extensions;
using Mindtag.Core.DTOs.Announcement;
using Mindtag.Core.Interfaces;

namespace Mindtag.API.Controllers;

[Authorize]
[ApiController]
[Route("announcements")]
public sealed class AnnouncementsController : ControllerBase
{
    private readonly IAnnouncementService _announcementService;

    public AnnouncementsController(IAnnouncementService announcementService)
    {
        _announcementService = announcementService;
    }

    /// <summary>POST /announcements — create and fan-out notifications (Doctor | Admin)</summary>
    [AuthorizeRoles("Doctor", "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAnnouncementRequest request)
    {
        var authorId = HttpContext.GetCurrentUserId();
        var data = await _announcementService.CreateAndNotifyAsync(authorId, request);
        return Created($"/announcements/{data.Id}", new { success = true, data });
    }

    /// <summary>GET /announcements — list announcements with optional course filter</summary>
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] Guid? courseId, [FromQuery] int page = 1, [FromQuery] int limit = 20)
    {
        var (items, total) = await _announcementService.GetAsync(courseId, page, limit);
        return Ok(new { success = true, data = new { items, total, page, limit } });
    }
}
