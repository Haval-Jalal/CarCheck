using System.Collections.Concurrent;
using CarCheck.Application.Interfaces;

namespace CarCheck.Infrastructure.RateLimiting;

public class InMemoryRateLimitService : IRateLimitService
{
    private readonly ConcurrentDictionary<string, RateLimitEntry> _entries = new();

    public Task<RateLimitResult> CheckAsync(string key, int maxRequests, TimeSpan window, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        var entry = _entries.AddOrUpdate(key,
            _ => new RateLimitEntry(1, now.Add(window)),
            (_, existing) =>
            {
                if (now >= existing.ResetsAt)
                    return new RateLimitEntry(1, now.Add(window));

                return existing with { Count = existing.Count + 1 };
            });

        var isAllowed = entry.Count <= maxRequests;
        var remaining = Math.Max(0, maxRequests - entry.Count);

        return Task.FromResult(new RateLimitResult(isAllowed, remaining, maxRequests, entry.ResetsAt));
    }

    private record RateLimitEntry(int Count, DateTime ResetsAt);
}
