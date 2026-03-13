using CarCheck.Application.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace CarCheck.Infrastructure.RateLimiting;

public class InMemoryEmailRateLimitService : IEmailRateLimitService
{
    private readonly IMemoryCache _cache;
    private const int Max = 3;
    private static readonly TimeSpan Window = TimeSpan.FromHours(1);

    public InMemoryEmailRateLimitService(IMemoryCache cache)
    {
        _cache = cache;
    }

    public bool IsRateLimited(string email, string action)
    {
        var key = BuildKey(email, action);
        return _cache.TryGetValue(key, out int count) && count >= Max;
    }

    public void IncrementCount(string email, string action)
    {
        var key = BuildKey(email, action);
        _cache.TryGetValue(key, out int count);
        _cache.Set(key, count + 1, Window);
    }

    private static string BuildKey(string email, string action) =>
        $"email_rl:{action}:{email.ToLowerInvariant()}";
}
