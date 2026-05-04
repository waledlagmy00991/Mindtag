using Microsoft.EntityFrameworkCore;
using Mindtag.Core.Entities;
using Mindtag.Core.Interfaces;
using Mindtag.Infrastructure.Data;

namespace Mindtag.Infrastructure.Repositories;

public sealed class EnrollmentRepository : IEnrollmentRepository
{
    private readonly AppDbContext _db;

    public EnrollmentRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<bool> ExistsAsync(Guid studentId, Guid courseId)
    {
        return await _db.Enrollments
            .AnyAsync(e => e.StudentId == studentId && e.CourseId == courseId);
    }

    public async Task<Enrollment> CreateAsync(Enrollment enrollment)
    {
        _db.Enrollments.Add(enrollment);
        await _db.SaveChangesAsync();
        return enrollment;
    }

    public async Task DeleteAsync(Guid studentId, Guid courseId)
    {
        var enrollment = await _db.Enrollments
            .FirstOrDefaultAsync(e => e.StudentId == studentId && e.CourseId == courseId);
        
        if (enrollment is not null)
        {
            _db.Enrollments.Remove(enrollment);
            await _db.SaveChangesAsync();
        }
    }

    public async Task<IReadOnlyCollection<User>> GetStudentsByCourseIdAsync(Guid courseId)
    {
        return await _db.Enrollments
            .Where(e => e.CourseId == courseId)
            .Include(e => e.Student)
                .ThenInclude(s => s.StudentProfile)
            .Select(e => e.Student)
            .AsNoTracking()
            .ToListAsync();
    }
}
