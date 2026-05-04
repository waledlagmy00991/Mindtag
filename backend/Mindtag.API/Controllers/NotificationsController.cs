using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mindtag.API.Extensions;
using Mindtag.Core.Interfaces;

namespace Mindtag.API.Controllers;

[Authorize]
[ApiController]
[Route("notifications")]
public sealed class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly INotificationRepository _notificationRepo;

    public NotificationsController(INotificationService notificationService, INotificationRepository notificationRepo)
    {
        _notificationService = notificationService;
        _notificationRepo = notificationRepo;
    }

    /// <summary>GET /notifications — paginated list for current user</summary>
    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] int page = 1, [FromQuery] int limit = 20)
    {
        var userId = HttpContext.GetCurrentUserId();
        var (items, total) = await _notificationService.GetMyHistoryAsync(userId, page, limit);
        return Ok(new { success = true, data = new { items, total, page, limit } });
    }

    /// <summary>PATCH /notifications/:id/read — mark single notification as read</summary>
    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        await _notificationRepo.MarkAsReadAsync(id);
        return Ok(new { success = true, message = "Notification marked as read." });
    }

    /// <summary>PATCH /notifications/read-all — mark all notifications as read</summary>
    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = HttpContext.GetCurrentUserId();
        await _notificationService.ReadAllAsync(userId);
        return Ok(new { success = true, message = "All notifications marked as read." });
    }

    /// <summary>DELETE /notifications/:id — delete a notification</summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _notificationRepo.DeleteAsync(id);
        return Ok(new { success = true, message = "Notification deleted." });
    }
}
