using Mindtag.Core.Entities;

namespace Mindtag.Core.Interfaces;

/// <summary>Course DB access operations.</summary>
public interface ICourseRepository
{
    Task<(IReadOnlyCollection<Course> items, int total)> GetAllAsync(string? search, string? department, int page, int limit);
    Task<Course?> GetByIdAsync(Guid id);
    Task<Course?> GetByCodeAsync(string code);
    Task<Course> CreateAsync(Course course);
    Task UpdateAsync(Course course);
    Task SoftDeleteAsync(Guid id);
}

/// <summary>Student Enrollment DB access operations.</summary>
public interface IEnrollmentRepository
{
    Task<bool> ExistsAsync(Guid studentId, Guid courseId);
    Task<Enrollment> CreateAsync(Enrollment enrollment);
    Task DeleteAsync(Guid studentId, Guid courseId);
    Task<IReadOnlyCollection<User>> GetStudentsByCourseIdAsync(Guid courseId);
}
