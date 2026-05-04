using Microsoft.Extensions.Caching.Memory;
using Mindtag.Core.Interfaces;
using System.Collections.Concurrent;

namespace Mindtag.Infrastructure.Services;

/// <summary>
/// A drop-in memory-based replacement for Redis for local Windows execution without Docker.
/// Uses standard IMemoryCache for TTL storage, and a ConcurrentDictionary to track increment counters.
/// </summary>
public class MemoryCacheRedisService : IRedisService
{
    private readonly IMemoryCache _cache;
    private readonly ConcurrentDictionary<string, long> _counters = new();

    public MemoryCacheRedisService(IMemoryCache cache)
    {
        _cache = cache;
    }

    public Task<string?> GetAsync(string key)
    {
        if (_cache.TryGetValue(key, out string? value))
        {
            return Task.FromResult(value);
        }
        
        // Also check counters just in case they requested an incremented integer
        if (_counters.TryGetValue(key, out var longVal))
        {
            return Task.FromResult(longVal.ToString());
        }

        return Task.FromResult<string?>(null);
    }

    public Task SetAsync(string key, string value, TimeSpan? expiry = null)
    {
        if (expiry.HasValue)
        {
            _cache.Set(key, value, expiry.Value);
        }
        else
        {
            // Default 30 days if no TTL specified to prevent memory leaks over months
            _cache.Set(key, value, TimeSpan.FromDays(30)); 
        }
        return Task.CompletedTask;
    }

    public Task DeleteAsync(string key)
    {
        _cache.Remove(key);
        _counters.TryRemove(key, out _);
        return Task.CompletedTask;
    }

    public Task<long> IncrementAsync(string key)
    {
        var newValue = _counters.AddOrUpdate(key, 1, (_, oldValue) => oldValue + 1);
        return Task.FromResult(newValue);
    }

    public Task ExpireAsync(string key, TimeSpan expiry)
    {
        // Re-set the TTL in IMemoryCache if it exists
        if (_cache.TryGetValue(key, out string? value))
        {
            _cache.Set(key, value, expiry);
        }
        else if (_counters.TryGetValue(key, out var countVal))
        {
            // If they are setting TTL on a rate limit counter, we can just mirror it to cache
            _cache.Set(key, countVal.ToString(), expiry);
        }
        return Task.CompletedTask;
    }
}
