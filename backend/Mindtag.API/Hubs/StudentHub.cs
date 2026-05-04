using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Mindtag.API.Auth;
using Mindtag.API.Extensions;
using Mindtag.Core.Interfaces;

namespace Mindtag.API.Hubs;

/// <summary>
/// Real-time WebSocket hub for students (Mobile App).
/// Pushes new Notifications and Announcements.
/// </summary>
[AuthorizeRoles("Student")]
public sealed class StudentHub : Hub
{
    private readonly IEnrollmentRepository _enrollmentRepo;

    public StudentHub(IEnrollmentRepository enrollmentRepo)
    {
        _enrollmentRepo = enrollmentRepo;
    }

    /// <summary>
    /// Subscribes the student to global course announcements by joining multiple course groups.
    /// Safely ignores courses the student is not actually enrolled in.
    /// </summary>
    public async Task SubscribeCourses(IEnumerable<Guid> courseIds)
    {
        var studentId = Guid.Parse(Context.User!.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

        foreach (var courseId in courseIds)
        {
            // Verify enrollment before adding to target broadcast group
            if (await _enrollmentRepo.ExistsAsync(studentId, courseId))
            {
                var groupName = $"course:{courseId}";
                await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            }
        }
    }
}
