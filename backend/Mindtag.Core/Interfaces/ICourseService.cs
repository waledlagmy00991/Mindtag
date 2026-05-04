using Mindtag.Core.DTOs;
using Mindtag.Core.DTOs.Course;
using Mindtag.Core.DTOs.User;

namespace Mindtag.Core.Interfaces;

/// <summary>
/// Service handling Course CRUD, Scheduling, and Student Enrollments.
/// </summary>
public interface ICourseService
{
    // CRUD
    Task<PaginatedList<CourseDTO>> GetAllAsync(string? search, string? department, int page, int limit);
    Task<CourseDTO> GetByIdAsync(Guid id);
    Task<CourseDTO> CreateAsync(Guid userId, string userRole, CreateCourseRequest request);
    Task<CourseDTO> UpdateAsync(Guid courseId, Guid userId, string userRole, PatchCourseRequest request);
    Task SoftDeleteAsync(Guid courseId); // Admin only, enforcement is mostly in controller or here

    // Enrollments
    Task EnrollStudentAsync(Guid courseId, Guid studentId);
    Task UnenrollStudentAsync(Guid courseId, Guid studentId);
    Task<IReadOnlyCollection<UserProfileDTO>> GetEnrolledStudentsAsync(Guid courseId, Guid doctorId, string role);

    // Schedules
    Task<ScheduleSlotDTO> AddScheduleSlotAsync(Guid courseId, Guid userId, string userRole, CreateScheduleRequest request);
    Task RemoveScheduleSlotAsync(Guid courseId, Guid slotId, Guid userId, string userRole);
}
