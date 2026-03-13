namespace CarCheck.Application.Interfaces;

/// <summary>
/// Prevents email flooding by rate-limiting per-address per-action (max 3 per hour).
/// </summary>
public interface IEmailRateLimitService
{
    bool IsRateLimited(string email, string action);
    void IncrementCount(string email, string action);
}
