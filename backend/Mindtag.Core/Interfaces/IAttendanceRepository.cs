using Mindtag.Core.Entities;

namespace Mindtag.Core.Interfaces;

/// <summary>
/// Data access for student attendance records.
/// </summary>
public interface IAttendanceRepository
{
    Task<bool> ExistsAsync(Guid sessionId, Guid studentId);
    Task<AttendanceRecord> CreateAsync(AttendanceRecord record);
    Task UpdateAsync(AttendanceRecord record);
    Task<AttendanceRecord?> GetByIdAsync(Guid id);
    
    /// <summary>Used by the doctor to view attendance for a specific session.</summary>
    Task<IReadOnlyCollection<AttendanceRecord>> GetBySessionAsync(Guid sessionId);
    
    /// <summary>Paginated history view for the student.</summary>
    Task<(IReadOnlyCollection<AttendanceRecord> items, int total)> GetByStudentAsync(Guid studentId, Guid? courseId, int page, int limit);
    
    /// <summary>Specifically grabs the most recent scan TODAY for the speed anomaly checks.</summary>
    Task<AttendanceRecord?> GetLastRecordTodayAsync(Guid studentId);
    
    /// <summary>Fetches all active enrollments with their attendance and session data for calculating summary UI thresholds.</summary>
    Task<IReadOnlyCollection<Enrollment>> GetStudentEnrollmentsWithHistoryAsync(Guid studentId);
}
