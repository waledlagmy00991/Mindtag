using Mindtag.Core.DTOs.Auth;

namespace Mindtag.Core.Interfaces;

/// <summary>
/// Authentication service interface — covers register, login, refresh, logout,
/// FCM token, and device reset flows.
/// </summary>
public interface IAuthService
{
    Task<AuthResponseDTO> RegisterAsync(RegisterRequest request);
    Task<AuthResponseDTO> LoginAsync(LoginRequest request);
    Task<AuthResponseDTO> RefreshAsync(RefreshRequest request);
    Task LogoutAsync(Guid userId, LogoutRequest request);
    Task UpdateFcmTokenAsync(Guid userId, string fcmToken);
    Task DeviceResetRequestAsync(string email);
    Task<AuthResponseDTO> DeviceResetConfirmAsync(DeviceResetConfirmRequest request);
}
