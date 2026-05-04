namespace Mindtag.Core.DTOs.User;

public sealed record UpdateProfileRequest(
    string? FullName,
    string? AvatarUrl,
    // Student fields
    string? StudentId,
    string? Department,
    int? Year,
    // Doctor fields
    string? Title);

public sealed record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword);

public sealed record UpdateUserStatusRequest(
    bool IsActive);

public sealed record UserProfileDTO(
    Guid Id,
    string Email,
    string FullName,
    string Role,
    string? AvatarUrl,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    
    // Student-specific
    string? StudentId,
    string? Department,
    int? Year,
    
    // Doctor-specific
    string? Title
);
