using Microsoft.EntityFrameworkCore;
using Mindtag.Core.Entities;
using Mindtag.Core.Interfaces;
using Mindtag.Infrastructure.Data;

namespace Mindtag.Infrastructure.Repositories;

/// <summary>
/// Concrete repository for User DB access.
/// </summary>
public sealed class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;

    public UserRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _db.Users
            .Include(u => u.StudentProfile)
            .Include(u => u.DoctorProfile)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _db.Users
            .Include(u => u.StudentProfile)
            .Include(u => u.DoctorProfile)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
    }

    public async Task UpdateAsync(User user)
    {
        user.UpdatedAt = DateTime.UtcNow;
        _db.Users.Update(user);
        await _db.SaveChangesAsync();
    }

    public async Task ClearFcmTokenAsync(string fcmToken)
    {
        var users = await _db.Users.Where(u => u.FcmToken == fcmToken).ToListAsync();
        foreach (var user in users)
        {
            user.FcmToken = null;
        }
        await _db.SaveChangesAsync();
    }
}
