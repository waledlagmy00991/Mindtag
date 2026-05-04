using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mindtag.API.Auth;
using Mindtag.API.Extensions;
using Mindtag.Core.DTOs.Course;
using Mindtag.Core.Interfaces;
using System.Security.Claims;

namespace Mindtag.API.Controllers;

[Authorize]
[ApiController]
[Route("courses")]
public sealed class CoursesController : ControllerBase
{
    private readonly ICourseService _courseService;
    private readonly IAttendanceService _attendanceService;

    public CoursesController(ICourseService courseService, IAttendanceService attendanceService)
    {
        _courseService = courseService;
        _attendanceService = attendanceService;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] string? department, [FromQuery] int page = 1, [FromQuery] int limit = 10)
    {
        var result = await _courseService.GetAllAsync(search, department, page, limit);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _courseService.GetByIdAsync(id);
        return Ok(new { success = true, data = result });
    }

    [AuthorizeRoles("Doctor", "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCourseRequest request)
    {
        var userId = HttpContext.GetCurrentUserId();
        var userRole = User.FindFirstValue(ClaimTypes.Role) ?? "";
        
        var result = await _courseService.CreateAsync(userId, userRole, request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, new { success = true, data = result });
    }

    [AuthorizeRoles("Doctor", "Admin")]
    [HttpPatch("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] PatchCourseRequest request)
    {
        var userId = HttpContext.GetCurrentUserId();
        var userRole = User.FindFirstValue(ClaimTypes.Role) ?? "";
        
        var result = await _courseService.UpdateAsync(id, userId, userRole, request);
        return Ok(new { success = true, data = result });
    }

    [AuthorizeRoles("Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> SoftDelete(Guid id)
    {
        await _courseService.SoftDeleteAsync(id);
        return Ok(new { success = true, message = "Course deleted successfully." });
    }

    [AuthorizeRoles("Doctor", "Admin")]
    [HttpGet("{id}/attendance-archive")]
    public async Task<IActionResult> GetAttendanceArchive(Guid id)
    {
        var userId = HttpContext.GetCurrentUserId();
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "";
        
        var result = await _attendanceService.GetCourseArchiveAsync(id, userId, role);
        return Ok(new { success = true, data = result });
    }

    // ─── Enrollments ───────────────────────────────────────────────────────────

    [AuthorizeRoles("Student")]
    [HttpPost("{id}/enroll")]
    public async Task<IActionResult> Enroll(Guid id)
    {
        var studentId = HttpContext.GetCurrentUserId();
        await _courseService.EnrollStudentAsync(id, studentId);
        return Ok(new { success = true, message = "Enrolled successfully." });
    }

    [AuthorizeRoles("Student")]
    [HttpDelete("{id}/enroll")]
    public async Task<IActionResult> Unenroll(Guid id)
    {
        var studentId = HttpContext.GetCurrentUserId();
        await _courseService.UnenrollStudentAsync(id, studentId);
        return Ok(new { success = true, message = "Unenrolled successfully." });
    }

    [AuthorizeRoles("Doctor", "Admin")]
    [HttpGet("{id}/students")]
    public async Task<IActionResult> GetEnrolledStudents(Guid id)
    {
        var userId = HttpContext.GetCurrentUserId();
        var userRole = User.FindFirstValue(ClaimTypes.Role) ?? "";

        var result = await _courseService.GetEnrolledStudentsAsync(id, userId, userRole);
        return Ok(new { success = true, data = result });
    }

    // ─── Schedules ─────────────────────────────────────────────────────────────

    [AuthorizeRoles("Doctor", "Admin")]
    [HttpPost("{id}/schedule")]
    public async Task<IActionResult> AddSchedule(Guid id, [FromBody] CreateScheduleRequest request)
    {
        var userId = HttpContext.GetCurrentUserId();
        var userRole = User.FindFirstValue(ClaimTypes.Role) ?? "";

        var result = await _courseService.AddScheduleSlotAsync(id, userId, userRole, request);
        return Ok(new { success = true, data = result });
    }

    [AuthorizeRoles("Doctor", "Admin")]
    [HttpDelete("{id}/schedule/{slotId}")]
    public async Task<IActionResult> RemoveSchedule(Guid id, Guid slotId)
    {
        var userId = HttpContext.GetCurrentUserId();
        var userRole = User.FindFirstValue(ClaimTypes.Role) ?? "";

        await _courseService.RemoveScheduleSlotAsync(id, slotId, userId, userRole);
        return Ok(new { success = true, message = "Schedule slot removed." });
    }
}
