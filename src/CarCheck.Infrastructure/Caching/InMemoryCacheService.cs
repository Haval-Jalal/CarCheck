using System.Text.Json;
using CarCheck.Application.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace CarCheck.Infrastructure.Caching;

public class InMemoryCacheService : ICacheService
{
    private readonly IMemoryCache _cache;

    public InMemoryCacheService(IMemoryCache cache)
    {
        _cache = cache;
    }

    public Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default) where T : class
    {
        _cache.TryGetValue(key, out string? json);
        if (json is null) return Task.FromResult<T?>(null);

        var value = JsonSerializer.Deserialize<T>(json);
        return Task.FromResult(value);
    }

    public Task SetAsync<T>(string key, T value, TimeSpan expiration, CancellationToken cancellationToken = default) where T : class
    {
        var json = JsonSerializer.Serialize(value);
        _cache.Set(key, json, expiration);
        return Task.CompletedTask;
    }

    public Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        _cache.Remove(key);
        return Task.CompletedTask;
    }
}
