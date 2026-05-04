namespace Mindtag.Core.DTOs.Announcement;

public sealed record AnnouncementDTO(
    Guid Id,
    Guid? CourseId,
    string? CourseCode,
    string? CourseName,
    Guid AuthorId,
    string AuthorName,
    string Title,
    string Body,
    DateTime CreatedAt);

public sealed record CreateAnnouncementRequest(
    Guid? CourseId,
    string Title,
    string Body);
