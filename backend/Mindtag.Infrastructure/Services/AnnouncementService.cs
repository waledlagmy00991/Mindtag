using Mindtag.Core.DTOs.Announcement;
using Mindtag.Core.Entities;
using Mindtag.Core.Enums;
using Mindtag.Core.Exceptions;
using Mindtag.Core.Interfaces;

namespace Mindtag.Infrastructure.Services;

public sealed class AnnouncementService : IAnnouncementService
{
    private readonly IAnnouncementRepository _announcementRepo;
    private readonly ICourseRepository _courseRepo;
    private readonly IEnrollmentRepository _enrollmentRepo;
    private readonly INotificationService _notificationService;
    private readonly IUserRepository _userRepo;

    public AnnouncementService(
        IAnnouncementRepository announcementRepo,
        ICourseRepository courseRepo,
        IEnrollmentRepository enrollmentRepo,
        INotificationService notificationService,
        IUserRepository userRepo)
    {
        _announcementRepo = announcementRepo;
        _courseRepo = courseRepo;
        _enrollmentRepo = enrollmentRepo;
        _notificationService = notificationService;
        _userRepo = userRepo;
    }

    public async Task<AnnouncementDTO> CreateAndNotifyAsync(Guid authorId, CreateAnnouncementRequest request)
    {
        var author = await _userRepo.GetByIdAsync(authorId)
            ?? throw new AppException("NOT_FOUND", "Author not found.");

        Course? course = null;
        if (request.CourseId.HasValue)
        {
            course = await _courseRepo.GetByIdAsync(request.CourseId.Value)
                ?? throw new AppException("NOT_FOUND", "Course not found.");
        }

        var announcement = new Announcement
        {
            Id = Guid.NewGuid(),
            CourseId = request.CourseId,
            AuthorId = authorId,
            Title = request.Title,
            Body = request.Body,
            CreatedAt = DateTime.UtcNow
        };

        await _announcementRepo.CreateAsync(announcement);

        // Fan out notifications to enrolled students
        if (request.CourseId.HasValue)
        {
            var students = await _enrollmentRepo.GetStudentsByCourseIdAsync(request.CourseId.Value);
            foreach (var student in students)
            {
                await _notificationService.CreateAndSendAsync(
                    student.Id,
                    NotificationType.Announcement,
                    $"📢 {request.Title}",
                    request.Body,
                    new Dictionary<string, string>
                    {
                        ["announcementId"] = announcement.Id.ToString(),
                        ["courseId"] = request.CourseId.Value.ToString()
                    });
            }
        }

        return new AnnouncementDTO(
            announcement.Id,
            announcement.CourseId,
            course?.Code,
            course?.Name,
            authorId,
            author.FullName,
            announcement.Title,
            announcement.Body,
            announcement.CreatedAt);
    }

    public async Task<(IReadOnlyCollection<AnnouncementDTO> items, int total)> GetAsync(Guid? courseId, int page, int limit)
    {
        var (items, total) = await _announcementRepo.GetAsync(courseId, page, limit);
        var dtos = items.Select(a => new AnnouncementDTO(
            a.Id, a.CourseId, a.Course?.Code, a.Course?.Name,
            a.AuthorId, a.Author?.FullName ?? "Unknown",
            a.Title, a.Body, a.CreatedAt)).ToList();
        return (dtos, total);
    }
}
