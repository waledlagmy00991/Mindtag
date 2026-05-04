using System.Security.Claims;

namespace Mindtag.API.Extensions;

/// <summary>
/// Extension methods for extracting claims from HttpContext.
/// </summary>
public static class HttpContextExtensions
{
    /// <summary>
    /// Extract the current authenticated user's ID from JWT claims.
    /// </summary>
    public static Guid GetCurrentUserId(this HttpContext context)
    {
        var claim = context.User.FindFirst(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("User ID claim not found.");

        return Guid.Parse(claim.Value);
    }
}
