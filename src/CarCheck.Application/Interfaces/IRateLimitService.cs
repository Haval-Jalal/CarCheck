namespace CarCheck.Application.Interfaces;

public interface IRateLimitService
{
    Task<RateLimitResult> CheckAsync(string key, int maxRequests, TimeSpan window, CancellationToken cancellationToken = default);
}

public record RateLimitResult(
    bool IsAllowed,
    int Remaining,
    int Limit,
    DateTime ResetsAt);
