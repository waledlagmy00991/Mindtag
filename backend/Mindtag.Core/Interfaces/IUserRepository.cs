using Mindtag.Core.Entities;

namespace Mindtag.Core.Interfaces;

/// <summary>
/// Repository for User entity data access, including eager loading profiles. PRD §14.5
/// </summary>
public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByEmailAsync(string email);
    Task UpdateAsync(User user);
    Task ClearFcmTokenAsync(string fcmToken);
}
