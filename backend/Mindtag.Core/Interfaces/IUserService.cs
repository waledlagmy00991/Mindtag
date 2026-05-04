using Mindtag.Core.DTOs.User;

namespace Mindtag.Core.Interfaces;

/// <summary>
/// Service handling User Profile, Password changes, and Admin user management.
/// </summary>
public interface IUserService
{
    Task<UserProfileDTO> GetMeAsync(Guid userId);
    Task<UserProfileDTO> UpdateProfileAsync(Guid userId, UpdateProfileRequest request);
    Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request);
    
    // Admin ops
    Task<UserProfileDTO> GetUserByIdAsync(Guid id);
    Task<UserProfileDTO> UpdateUserStatusAsync(Guid id, UpdateUserStatusRequest request);
}
