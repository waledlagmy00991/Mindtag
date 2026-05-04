using System.Net;
using System.Text.Json;
using Mindtag.Core.Exceptions;

namespace Mindtag.API.Middleware;

/// <summary>
/// Global error handling middleware. Catches AppException (domain errors) and
/// unhandled exceptions, returning a consistent JSON response envelope.
/// Must be registered first in the middleware pipeline.
/// </summary>
public sealed class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    /// <summary>
    /// Maps AppException error codes to HTTP status codes.
    /// Sources: PRD §5.2 + §14.12.
    /// </summary>
    private static readonly Dictionary<string, int> ErrorCodeStatusMap = new()
    {
        // ─── Auth (PRD §5.2) ───────────────────────────────────────────
        ["INVALID_CREDENTIALS"]       = StatusCodes.Status401Unauthorized,
        ["EMAIL_NOT_UNIVERSITY"]      = StatusCodes.Status422UnprocessableEntity,
        ["EMAIL_ALREADY_EXISTS"]      = StatusCodes.Status409Conflict,
        ["TOKEN_EXPIRED"]             = StatusCodes.Status401Unauthorized,
        ["TOKEN_INVALID"]             = StatusCodes.Status401Unauthorized,
        ["REFRESH_TOKEN_INVALID"]     = StatusCodes.Status401Unauthorized,
        ["UNAUTHORIZED"]              = StatusCodes.Status401Unauthorized,
        ["FORBIDDEN"]                 = StatusCodes.Status403Forbidden,

        // ─── Attendance (PRD §5.2) ─────────────────────────────────────
        ["SESSION_NOT_ACTIVE"]        = StatusCodes.Status409Conflict,
        ["QR_EXPIRED"]                = StatusCodes.Status410Gone,
        ["QR_INVALID"]                = StatusCodes.Status422UnprocessableEntity,
        ["NOT_ENROLLED"]              = StatusCodes.Status403Forbidden,
        ["ALREADY_CHECKED_IN"]        = StatusCodes.Status409Conflict,
        ["OUT_OF_RANGE"]              = StatusCodes.Status422UnprocessableEntity,
        ["GPS_REQUIRED"]              = StatusCodes.Status422UnprocessableEntity,

        // ─── General (PRD §5.2) ────────────────────────────────────────
        ["NOT_FOUND"]                 = StatusCodes.Status404NotFound,
        ["VALIDATION_ERROR"]          = StatusCodes.Status422UnprocessableEntity,

        // ─── §14.1 — QR Security ──────────────────────────────────────
        ["QR_ALREADY_USED"]           = StatusCodes.Status410Gone,

        // ─── §14.2 — GPS Validation ───────────────────────────────────
        ["GPS_ACCURACY_LOW"]          = StatusCodes.Status422UnprocessableEntity,
        ["GPS_MOCK_DETECTED"]         = StatusCodes.Status422UnprocessableEntity,

        // ─── §14.3 — Device Binding ───────────────────────────────────
        ["DEVICE_MISMATCH"]           = StatusCodes.Status403Forbidden,

        // ─── §14.5 — Business Rules ──────────────────────────────────
        ["ATTENDANCE_WINDOW_CLOSED"]  = StatusCodes.Status409Conflict,

        // ─── §14.8 — Rate Limiting & Abuse ────────────────────────────
        ["RATE_LIMIT_EXCEEDED"]       = StatusCodes.Status429TooManyRequests,
        ["ACCOUNT_LOCKED"]            = StatusCodes.Status423Locked,
    };

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (AppException ex)
        {
            _logger.LogWarning("AppException: {ErrorCode} — {Message}", ex.ErrorCode, ex.Message);

            var statusCode = ErrorCodeStatusMap.GetValueOrDefault(ex.ErrorCode, StatusCodes.Status400BadRequest);

            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/json";

            var response = new
            {
                success = false,
                error = new
                {
                    code = ex.ErrorCode,
                    message = ex.Message
                }
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(response, JsonOptions));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");

            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/json";

                var response = new
                {
                    success = false,
                    error = new
                    {
                        code = "INTERNAL_ERROR",
                        message = ex.ToString()
                    }
                };

            await context.Response.WriteAsync(JsonSerializer.Serialize(response, JsonOptions));
        }
    }
}
