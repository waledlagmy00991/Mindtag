using Mindtag.Core.Entities;
using DayOfWeek = Mindtag.Core.Enums.DayOfWeek;

namespace Mindtag.Core.Interfaces;

public interface IScheduleRepository
{
    Task<IReadOnlyCollection<StudentScheduleSlot>> GetByStudentIdAsync(Guid studentId);
    Task<IReadOnlyCollection<StudentScheduleSlot>> GetByStudentAndDayAsync(Guid studentId, DayOfWeek day);
    Task<StudentScheduleSlot?> GetByIdAsync(Guid id);
    Task<StudentScheduleSlot> CreateAsync(StudentScheduleSlot slot);
    Task UpdateAsync(StudentScheduleSlot slot);
    Task DeleteAsync(Guid id);
    Task<bool> HasOverlapAsync(Guid studentId, DayOfWeek day, TimeSpan start, TimeSpan end, Guid? excludeId = null);
}
