using Microsoft.EntityFrameworkCore;
using Mindtag.Core.Entities;
using Mindtag.Core.Interfaces;
using Mindtag.Infrastructure.Data;

namespace Mindtag.Infrastructure.Repositories;

public sealed class CourseRepository : ICourseRepository
{
    private readonly AppDbContext _db;

    public CourseRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<(IReadOnlyCollection<Course>, int)> GetAllAsync(string? search, string? department, int page, int limit)
    {
        var query = _db.Courses
            .Include(c => c.Doctor)
                .ThenInclude(u => u.DoctorProfile)
            .Where(c => c.IsActive); // Only active courses

        if (!string.IsNullOrWhiteSpace(department))
        {
            query = query.Where(c => c.Doctor.DoctorProfile.Department == department);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(c => c.Code.ToLower().Contains(term) || c.Name.ToLower().Contains(term));
        }

        var total = await query.CountAsync();
        
        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .AsNoTracking()
            .ToListAsync();

        return (items, total);
    }

    public async Task<Course?> GetByIdAsync(Guid id)
    {
        return await _db.Courses
            .Include(c => c.Doctor)
                .ThenInclude(u => u.DoctorProfile)
            .Include(c => c.Schedules)
            .FirstOrDefaultAsync(c => c.Id == id && c.IsActive);
    }

    public async Task<Course?> GetByCodeAsync(string code)
    {
        return await _db.Courses
            .FirstOrDefaultAsync(c => c.Code == code && c.IsActive);
    }

    public async Task<Course> CreateAsync(Course course)
    {
        _db.Courses.Add(course);
        await _db.SaveChangesAsync();
        return course;
    }

    public async Task UpdateAsync(Course course)
    {
        course.UpdatedAt = DateTime.UtcNow;
        _db.Courses.Update(course);
        await _db.SaveChangesAsync();
    }

    public async Task SoftDeleteAsync(Guid id)
    {
        var course = await _db.Courses.FindAsync(id);
        if (course is not null)
        {
            course.IsActive = false;
            course.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }
}
