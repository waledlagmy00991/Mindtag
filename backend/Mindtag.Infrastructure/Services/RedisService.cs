using Mindtag.Core.Interfaces;
using StackExchange.Redis;

namespace Mindtag.Infrastructure.Services;

/// <summary>
/// Redis string operations wrapper using StackExchange.Redis.
/// Registered as a singleton — IConnectionMultiplexer is thread-safe and long-lived.
/// </summary>
public sealed class RedisService : IRedisService
{
    private readonly IDatabase _db;

    public RedisService(IConnectionMultiplexer redis)
    {
        _db = redis.GetDatabase();
    }

    /// <inheritdoc />
    public async Task<string?> GetAsync(string key)
    {
        var value = await _db.StringGetAsync(key);
        return value.IsNullOrEmpty ? null : value.ToString();
    }

    /// <inheritdoc />
    public async Task SetAsync(string key, string value, TimeSpan? expiry = null)
    {
        await _db.StringSetAsync(key, value, expiry);
    }

    /// <inheritdoc />
    public async Task DeleteAsync(string key)
    {
        await _db.KeyDeleteAsync(key);
    }

    /// <inheritdoc />
    public async Task<long> IncrementAsync(string key)
    {
        return await _db.StringIncrementAsync(key);
    }

    /// <inheritdoc />
    public async Task ExpireAsync(string key, TimeSpan expiry)
    {
        await _db.KeyExpireAsync(key, expiry);
    }
}
