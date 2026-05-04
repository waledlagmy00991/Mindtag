namespace Mindtag.Core.DTOs.Auth;

// ─── Requests ──────────────────────────────────────────────────────────────

public sealed record RegisterRequest(
    string Email,
    string Password,
    string FullName,
    string Role,
    string? StudentId,
    string? Department,
    int? Year,
    string? Title,
    List<Guid>? CourseIds,
    string DeviceId,
    string DeviceFingerprint,
    string Platform);

public sealed record LoginRequest(
    string Email,
    string Password,
    string DeviceId,
    string DeviceFingerprint,
    string Platform);

public sealed record RefreshRequest(string RefreshToken);

public sealed record LogoutRequest(string RefreshToken);

public sealed record FcmTokenRequest(string FcmToken);

public sealed record DeviceResetRequest(string Email);

public sealed record DeviceResetConfirmRequest(
    string Email,
    string Token,
    string NewDeviceId,
    string DeviceFingerprint,
    string Platform);

// ─── Responses ─────────────────────────────────────────────────────────────

public sealed record UserDTO(
    Guid Id,
    string Email,
    string FullName,
    string Role,
    string? AvatarUrl,
    bool IsProfileComplete,
    DateTime CreatedAt);

public sealed record AuthResponseDTO(
    UserDTO User,
    string AccessToken,
    string RefreshToken);
