using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mindtag.API.Extensions;
using Mindtag.Core.DTOs.Auth;
using Mindtag.Core.Interfaces;

namespace Mindtag.API.Controllers;

[ApiController]
[Route("auth")]
public sealed class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>POST /auth/register — Register a new student or doctor.</summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        return Ok(new { success = true, data = result });
    }

    /// <summary>POST /auth/login — Authenticate and receive tokens.</summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        return Ok(new { success = true, data = result });
    }

    /// <summary>POST /auth/refresh — Rotate refresh token and get new token pair.</summary>
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest request)
    {
        var result = await _authService.RefreshAsync(request);
        return Ok(new { success = true, data = result });
    }

    /// <summary>POST /auth/logout — Invalidate refresh token and clear FCM.</summary>
    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
    {
        var userId = HttpContext.GetCurrentUserId();
        await _authService.LogoutAsync(userId, request);
        return Ok(new { success = true, message = "Logged out successfully." });
    }

    /// <summary>POST /auth/fcm-token — Update FCM push notification token.</summary>
    [Authorize]
    [HttpPost("fcm-token")]
    public async Task<IActionResult> UpdateFcmToken([FromBody] FcmTokenRequest request)
    {
        var userId = HttpContext.GetCurrentUserId();
        await _authService.UpdateFcmTokenAsync(userId, request.FcmToken);
        return Ok(new { success = true, message = "FCM token updated." });
    }

    /// <summary>POST /auth/device-reset-request — Request a device reset email.</summary>
    [HttpPost("device-reset-request")]
    public async Task<IActionResult> DeviceResetRequest([FromBody] DeviceResetRequest request)
    {
        await _authService.DeviceResetRequestAsync(request.Email);
        return Ok(new { success = true, message = "If the email exists, a reset link has been sent." });
    }

    /// <summary>POST /auth/device-reset-confirm — Confirm device reset with token.</summary>
    [HttpPost("device-reset-confirm")]
    public async Task<IActionResult> DeviceResetConfirm([FromBody] DeviceResetConfirmRequest request)
    {
        var result = await _authService.DeviceResetConfirmAsync(request);
        return Ok(new { success = true, data = result });
    }
}
