using Mindtag.Core.DTOs.Schedule;

namespace Mindtag.Core.Interfaces;

public interface IScheduleService
{
    Task<Dictionary<string, List<ScheduleSlotDTO>>> GetWeeklyAsync(Guid studentId);
    Task<List<ScheduleSlotDTO>> GetTodayAsync(Guid studentId);
    Task<NextLectureDTO?> GetNextLectureAsync(Guid studentId);
    Task<ScheduleSlotDTO> CreateSlotAsync(Guid studentId, CreateSlotRequest request);
    Task<ScheduleSlotDTO> UpdateSlotAsync(Guid studentId, Guid slotId, UpdateSlotRequest request);
    Task DeleteSlotAsync(Guid studentId, Guid slotId);
}
