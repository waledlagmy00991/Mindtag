namespace Mindtag.Core.Interfaces;

/// <summary>
/// Abstraction over Redis string operations used across the application.
/// Implementations live in Mindtag.Infrastructure.
/// </summary>
public interface IRedisService
{
    /// <summary>Get a string value by key. Returns null if the key does not exist.</summary>
    Task<string?> GetAsync(string key);

    /// <summary>Set a string value with an optional TTL.</summary>
    Task SetAsync(string key, string value, TimeSpan? expiry = null);

    /// <summary>Delete a key.</summary>
    Task DeleteAsync(string key);

    /// <summary>Atomically increment a key's integer value. Creates the key with value 1 if it doesn't exist.</summary>
    Task<long> IncrementAsync(string key);

    /// <summary>Set an expiry (TTL) on an existing key.</summary>
    Task ExpireAsync(string key, TimeSpan expiry);
}
