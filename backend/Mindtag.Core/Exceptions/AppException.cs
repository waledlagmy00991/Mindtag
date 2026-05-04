namespace Mindtag.Core.Exceptions;

/// <summary>
/// Application-level exception carrying a machine-readable error code.
/// Caught by ErrorHandlingMiddleware and mapped to the appropriate HTTP status.
/// </summary>
public sealed class AppException : Exception
{
    /// <summary>
    /// Machine-readable error code (e.g., "INVALID_CREDENTIALS", "OUT_OF_RANGE").
    /// Maps to an HTTP status code in the middleware.
    /// </summary>
    public string ErrorCode { get; }

    public AppException(string errorCode)
        : base(errorCode)
    {
        ErrorCode = errorCode;
    }

    public AppException(string errorCode, string message)
        : base(message)
    {
        ErrorCode = errorCode;
    }
}
