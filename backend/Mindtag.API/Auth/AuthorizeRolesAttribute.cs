using Microsoft.AspNetCore.Authorization;

namespace Mindtag.API.Auth;

/// <summary>
/// Convenience attribute for role-based authorization.
/// Usage: [AuthorizeRoles("Student")] or [AuthorizeRoles("Doctor", "Admin")]
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public sealed class AuthorizeRolesAttribute : AuthorizeAttribute
{
    public AuthorizeRolesAttribute(params string[] roles)
    {
        Roles = string.Join(",", roles);
    }
}
