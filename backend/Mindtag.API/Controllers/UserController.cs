using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mindtag.API.Auth;
using Mindtag.API.Extensions;
using Mindtag.Core.DTOs.User;
using Mindtag.Core.Interfaces;

namespace Mindtag.API.Controllers;

[Authorize]
[ApiController]
[Route("users")]
public sealed class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>GET /users/me — Get the current user's profile.</summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var userId = HttpContext.GetCurrentUserId();
        var result = await _userService.GetMeAsync(userId);
        return Ok(new { success = true, data = result });
    }

    /// <summary>PATCH /users/me — Update the current user's profile.</summary>
    [HttpPatch("me")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = HttpContext.GetCurrentUserId();
        var result = await _userService.UpdateProfileAsync(userId, request);
        return Ok(new { success = true, data = result });
    }

    /// <summary>PATCH /users/me/password — Change current user's password.</summary>
    [HttpPatch("me/password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = HttpContext.GetCurrentUserId();
        await _userService.ChangePasswordAsync(userId, request);
        return Ok(new { success = true, message = "Password changed successfully. Please log in again." });
    }

    // ─── Admin Endpoints ───────────────────────────────────────────────────

    /// <summary>GET /users/{id} — [ADMIN] Get a specific user's full profile.</summary>
    [AuthorizeRoles("Admin")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(Guid id)
    {
        var result = await _userService.GetUserByIdAsync(id);
        return Ok(new { success = true, data = result });
    }

    /// <summary>PATCH /users/{id}/status — [ADMIN] Activate or deactivate a user.</summary>
    [AuthorizeRoles("Admin")]
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateUserStatus(Guid id, [FromBody] UpdateUserStatusRequest request)
    {
        var result = await _userService.UpdateUserStatusAsync(id, request);
        return Ok(new { success = true, data = result, message = request.IsActive ? "User activated." : "User deactivated and sessions invalidated." });
    }
}
