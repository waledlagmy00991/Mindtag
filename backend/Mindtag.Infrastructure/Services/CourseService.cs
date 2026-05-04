using Mindtag.Core.DTOs;
using Mindtag.Core.DTOs.Course;
using Mindtag.Core.DTOs.User;
using Mindtag.Core.Entities;
using Mindtag.Core.Exceptions;
using Mindtag.Core.Interfaces;
using Mindtag.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Mindtag.Infrastructure.Services;

public sealed class CourseService : ICourseService
{
    private readonly ICourseRepository _courseRepo;
    private readonly IEnrollmentRepository _enrollmentRepo;
    private readonly IAuditLogService _audit;
    private readonly AppDbContext _db; // Needed for Schedule manipulation

    public CourseService(
        ICourseRepository courseRepo,
        IEnrollmentRepository enrollmentRepo,
        IAuditLogService audit,
        AppDbContext db)
    {
        _courseRepo = courseRepo;
        _enrollmentRepo = enrollmentRepo;
        _audit = audit;
        _db = db;
    }

    // ─── CRUD ──────────────────────────────────────────────────────────────────

    public async Task<PaginatedList<CourseDTO>> GetAllAsync(string? search, string? department, int page, int limit)
    {
        if (page < 1) page = 1;
        if (limit < 1 || limit > 100) limit = 10;

        var (items, total) = await _courseRepo.GetAllAsync(search, department, page, limit);

        var dtos = items.Select(MapToDTO).ToList();
        return new PaginatedList<CourseDTO>(dtos, total, page, limit);
    }

    public async Task<CourseDTO> GetByIdAsync(Guid id)
    {
        var course = await _courseRepo.GetByIdAsync(id)
            ?? throw new AppException("NOT_FOUND", "Course not found.");

        return MapToDTO(course);
    }

    public async Task<CourseDTO> CreateAsync(Guid userId, string userRole, CreateCourseRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Code))
            throw new AppException("VALIDATION_ERROR", "Course code is required.");

        var existing = await _courseRepo.GetByCodeAsync(request.Code);
        if (existing is not null)
            throw new AppException("VALIDATION_ERROR", "A course with this code already exists.");

        Guid assignedDoctorId;
        if (userRole == "Admin") 
        {
            if (request.DoctorId is null || request.DoctorId == Guid.Empty)
                throw new AppException("VALIDATION_ERROR", "Admins must specify a DoctorId when creating a course.");
            assignedDoctorId = request.DoctorId.Value;
        }
        else 
        {
            assignedDoctorId = userId;
        }

        var course = new Course
        {
            Id = Guid.NewGuid(),
            DoctorId = assignedDoctorId,
            Code = request.Code.ToUpperInvariant(),
            Name = request.Name,
            Description = request.Description,
            CreditHours = request.CreditHours,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _courseRepo.CreateAsync(course);

        if (request.Schedules != null && request.Schedules.Any())
        {
            var schedules = request.Schedules.Select(s => new CourseSchedule
            {
                Id = Guid.NewGuid(),
                CourseId = course.Id,
                DayOfWeek = s.DayOfWeek,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                Room = s.Room
            }).ToList();
            _db.CourseSchedules.AddRange(schedules);
            await _db.SaveChangesAsync();
        }

        await _audit.LogAsync(userId, Core.Enums.AuditAction.CourseCreated, course.Id.ToString());

        // We need to fetch it again to include the doctor profile for the DTO
        var created = await _courseRepo.GetByIdAsync(course.Id);
        return MapToDTO(created!);
    }

    public async Task<CourseDTO> UpdateAsync(Guid courseId, Guid userId, string userRole, PatchCourseRequest request)
    {
        var course = await _courseRepo.GetByIdAsync(courseId)
            ?? throw new AppException("NOT_FOUND", "Course not found.");

        if (userRole != "Admin" && course.DoctorId != userId)
            throw new AppException("FORBIDDEN", "Only the assigned doctor or an admin can modify this course.");

        if (request.Name is not null)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                throw new AppException("VALIDATION_ERROR", "Course name cannot be empty.");
            course.Name = request.Name;
        }

        if (request.Description is not null)
        {
            course.Description = request.Description;
        }

        if (request.CreditHours.HasValue) 
        {
            course.CreditHours = request.CreditHours.Value;
        }

        if (request.Schedules != null)
        {
            var existingSchedules = await _db.CourseSchedules.Where(s => s.CourseId == course.Id).ToListAsync();
            _db.CourseSchedules.RemoveRange(existingSchedules);

            if (request.Schedules.Any())
            {
                var newSchedules = request.Schedules.Select(s => new CourseSchedule
                {
                    Id = Guid.NewGuid(),
                    CourseId = course.Id,
                    DayOfWeek = s.DayOfWeek,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    Room = s.Room
                }).ToList();
                _db.CourseSchedules.AddRange(newSchedules);
            }
            await _db.SaveChangesAsync();
        }

        await _courseRepo.UpdateAsync(course);
        return MapToDTO(course);
    }

    public async Task SoftDeleteAsync(Guid courseId)
    {
        await _courseRepo.SoftDeleteAsync(courseId);
        await _audit.LogAsync(null, Core.Enums.AuditAction.CourseDeleted, courseId.ToString()); // Admin action
    }

    // ─── Enrollments ───────────────────────────────────────────────────────────

    public async Task EnrollStudentAsync(Guid courseId, Guid studentId)
    {
        var course = await _courseRepo.GetByIdAsync(courseId)
            ?? throw new AppException("NOT_FOUND", "Course not found.");

        var exists = await _enrollmentRepo.ExistsAsync(studentId, courseId);
        if (exists)
            throw new AppException("DUPLICATE_ENROLLMENT", "Student is already enrolled in this course.");

        var enrollment = new Enrollment
        {
            CourseId = courseId,
            StudentId = studentId,
            EnrolledAt = DateTime.UtcNow
        };

        await _enrollmentRepo.CreateAsync(enrollment);
        await _audit.LogAsync(studentId, Core.Enums.AuditAction.StudentEnrolled, courseId.ToString());
    }

    public async Task UnenrollStudentAsync(Guid courseId, Guid studentId)
    {
        await _enrollmentRepo.DeleteAsync(studentId, courseId);
        await _audit.LogAsync(studentId, Core.Enums.AuditAction.StudentUnenrolled, courseId.ToString());
    }

    public async Task<IReadOnlyCollection<UserProfileDTO>> GetEnrolledStudentsAsync(Guid courseId, Guid doctorId, string role)
    {
        var course = await _courseRepo.GetByIdAsync(courseId)
            ?? throw new AppException("NOT_FOUND", "Course not found.");

        if (role != "Admin" && course.DoctorId != doctorId)
            throw new AppException("FORBIDDEN", "Only the assigned doctor or an admin can view student lists.");

        var students = await _enrollmentRepo.GetStudentsByCourseIdAsync(courseId);
        
        return students.Select(u => new UserProfileDTO(
            u.Id, u.Email, u.FullName, u.Role.ToString(), u.AvatarUrl, u.IsActive, u.CreatedAt, u.UpdatedAt,
            u.StudentProfile?.StudentId, u.StudentProfile?.Department, u.StudentProfile?.Year, null
        )).ToList();
    }

    // ─── Schedules ─────────────────────────────────────────────────────────────

    public async Task<ScheduleSlotDTO> AddScheduleSlotAsync(Guid courseId, Guid userId, string userRole, CreateScheduleRequest request)
    {
        if (request.StartTime >= request.EndTime)
            throw new AppException("VALIDATION_ERROR", "Start time must be before end time.");

        var course = await _courseRepo.GetByIdAsync(courseId)
            ?? throw new AppException("NOT_FOUND", "Course not found.");

        if (userRole != "Admin" && course.DoctorId != userId)
            throw new AppException("FORBIDDEN", "Only the assigned doctor or an admin can modify schedules.");

        var duplicateSlot = course.Schedules.FirstOrDefault(s => 
            s.DayOfWeek == request.DayOfWeek && 
            s.StartTime == request.StartTime);

        if (duplicateSlot is not null)
            throw new AppException("DUPLICATE_SCHEDULE_SLOT", "A schedule slot already exists for this day and time.");

        var slot = new CourseSchedule
        {
            Id = Guid.NewGuid(),
            CourseId = courseId,
            DayOfWeek = request.DayOfWeek,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Room = request.Room
        };

        _db.CourseSchedules.Add(slot);
        await _db.SaveChangesAsync(); // direct save to avoid fetching entity again

        return new ScheduleSlotDTO(slot.Id, slot.DayOfWeek, slot.StartTime, slot.EndTime, slot.Room);
    }

    public async Task RemoveScheduleSlotAsync(Guid courseId, Guid slotId, Guid userId, string userRole)
    {
        var course = await _courseRepo.GetByIdAsync(courseId)
            ?? throw new AppException("NOT_FOUND", "Course not found.");

        if (userRole != "Admin" && course.DoctorId != userId)
            throw new AppException("FORBIDDEN", "Only the assigned doctor or an admin can modify schedules.");

        var slot = await _db.CourseSchedules.FirstOrDefaultAsync(s => s.Id == slotId && s.CourseId == courseId);
        if (slot is not null)
        {
            _db.CourseSchedules.Remove(slot);
            await _db.SaveChangesAsync();
        }
    }

    // ─── Mappers ───────────────────────────────────────────────────────────────

    private static CourseDTO MapToDTO(Course course)
    {
        var docName = course.Doctor?.FullName ?? "Unknown";
        var docTitle = course.Doctor?.DoctorProfile?.Title;

        var schedules = course.Schedules?
            .Select(s => new ScheduleSlotDTO(s.Id, s.DayOfWeek, s.StartTime, s.EndTime, s.Room))
            .ToList() ?? new List<ScheduleSlotDTO>();

        return new CourseDTO(
            Id: course.Id,
            Code: course.Code,
            Name: course.Name,
            Description: course.Description,
            CreditHours: course.CreditHours,
            IsActive: course.IsActive,
            CreatedAt: course.CreatedAt,
            Doctor: new CourseDoctorDTO(course.DoctorId, docName, docTitle),
            Schedules: schedules
        );
    }
}
