using CarCheck.Application.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace CarCheck.Infrastructure.RateLimiting;

public class InMemoryEmailRateLimitService : IEmailRateLimitService
{
    private readonly IMemoryCache _cache;
    private static readonly TimeSpan Window = TimeSpan.FromHours(1);

    // Password reset is more sensitive — 1 per hour to limit abuse
    private static int GetMax(string action) => action == "reset" ? 1 : 3;

    public InMemoryEmailRateLimitService(IMemoryCache cache)
    {
        _cache = cache;
    }

    public bool IsRateLimited(string email, string action)
    {
        var key = BuildKey(email, action);
        return _cache.TryGetValue(key, out int count) && count >= GetMax(action);
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
