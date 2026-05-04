using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Mindtag.Core.Interfaces;
using Mindtag.Infrastructure.Data;

namespace Mindtag.Infrastructure.Jobs;


/// <summary>
/// Sends push notification reminders 15 minutes before scheduled lectures. PRD §10.
/// Stub — implementation comes in M4.
/// </summary>
public sealed class LectureReminderJob
{
    private readonly INotificationService _notificationService;
    private readonly AppDbContext _db;
    private readonly ILogger<LectureReminderJob> _logger;

    public LectureReminderJob(INotificationService notificationService, AppDbContext db, ILogger<LectureReminderJob> logger)
    {
        _notificationService = notificationService;
        _db = db;
        _logger = logger;
    }

    public async Task ExecuteAsync()
    {
        // 1. Calculate target time = NOW + 10 mins
        var targetTime = DateTime.UtcNow.AddMinutes(10);
        var targetDay = (Mindtag.Core.Enums.DayOfWeek)(int)targetTime.DayOfWeek;
        // Strip seconds to match database TimeSpan precisely
        var targetTimeOfDay = new TimeSpan(targetTime.Hour, targetTime.Minute, 0);

        var schedules = await _db.CourseSchedules
            .Include(s => s.Course)
            .Where(s => s.DayOfWeek == targetDay && s.StartTime == targetTimeOfDay)
            .ToListAsync();

        if (!schedules.Any()) return;

        int dispatchCount = 0;
        foreach (var schedule in schedules)
        {
            var studentIds = await _db.Enrollments
                .Where(e => e.CourseId == schedule.CourseId)
                .Select(e => e.StudentId)
                .ToListAsync();

            foreach (var studentId in studentIds)
            {
                await _notificationService.CreateAndSendAsync(
                    studentId,
                    Mindtag.Core.Enums.NotificationType.LectureReminder,
                    $"Lecture starts soon: {schedule.Course.Code}",
                    $"Your class {schedule.Course.Name} starts in 10 minutes at {schedule.Room ?? "TBA"}.",
                    new Dictionary<string, string> { { "courseId", schedule.CourseId.ToString() } }
                );
                dispatchCount++;
            }
        }
        
        _logger.LogInformation($"Dispatched {dispatchCount} lecture reminders for {schedules.Count} upcoming modules.");
    }
}

/// <summary>
/// Sends daily schedule push notification at 21:00 for the next day. PRD §10.
/// Stub — implementation comes in M4.
/// </summary>
public sealed class DailyScheduleJob
{
    private readonly ILogger<DailyScheduleJob> _logger;

    public DailyScheduleJob(ILogger<DailyScheduleJob> logger)
    {
        _logger = logger;
    }

    public Task ExecuteAsync()
    {
        _logger.LogDebug("DailyScheduleJob executed (stub)");
        return Task.CompletedTask;
    }
}


/// <summary>
/// Cleans up expired notifications at 02:00 daily. PRD §10.
/// Stub — implementation comes in M4.
/// </summary>
public sealed class NotificationCleanupJob
{
    private readonly ILogger<NotificationCleanupJob> _logger;

    public NotificationCleanupJob(ILogger<NotificationCleanupJob> logger)
    {
        _logger = logger;
    }

    public Task ExecuteAsync()
    {
        _logger.LogDebug("NotificationCleanupJob executed (stub)");
        return Task.CompletedTask;
    }
}

/// <summary>
/// Cleans up audit log entries older than retention period at 03:00 daily. PRD §14.9.
/// Stub — implementation comes in M5.
/// </summary>
public sealed class AuditCleanupJob
{
    private readonly ILogger<AuditCleanupJob> _logger;

    public AuditCleanupJob(ILogger<AuditCleanupJob> logger)
    {
        _logger = logger;
    }

    public Task ExecuteAsync()
    {
        _logger.LogDebug("AuditCleanupJob executed (stub)");
        return Task.CompletedTask;
    }
}

/// <summary>
/// Recalculates risk status for all enrollments at 23:00 daily. PRD §14.7.3.
/// Stub — implementation comes in M5.
/// </summary>
public sealed class RiskDetectionJob
{
    private readonly ILogger<RiskDetectionJob> _logger;

    public RiskDetectionJob(ILogger<RiskDetectionJob> logger)
    {
        _logger = logger;
    }

    public Task ExecuteAsync()
    {
        _logger.LogDebug("RiskDetectionJob executed (stub)");
        return Task.CompletedTask;
    }
}
