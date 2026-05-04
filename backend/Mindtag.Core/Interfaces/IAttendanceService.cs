using Mindtag.Core.DTOs.Attendance;

namespace Mindtag.Core.Interfaces;

/// <summary>
/// Domain logic for student attendance scanning, overrides, and summaries.
/// </summary>
public interface IAttendanceService
{
    Task<AttendanceRecordDTO> ScanAttendanceAsync(Guid studentId, ScanAttendanceRequest request);
    Task<IReadOnlyCollection<AttendanceSummaryItemDTO>> GetSummaryAsync(Guid studentId);
    
    // Doctor & Admin viewing
    Task<CourseArchiveDTO> GetCourseArchiveAsync(Guid courseId, Guid userId, string role);

    // Admin-only rapid toggle
    Task AdminToggleAttendanceAsync(Guid adminId, AdminToggleAttendanceRequest request);

    // Doctor actions
    Task OverrideAttendanceAsync(Guid doctorId, Guid recordId, OverrideAttendanceRequest request);
    Task ManualAddAttendanceAsync(Guid doctorId, Guid sessionId, ManualAttendanceRequest request);
}
