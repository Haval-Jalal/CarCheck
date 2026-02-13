using System.Security.Claims;
using CarCheck.Application.Billing;
using CarCheck.Domain.Enums;
using CarCheck.Domain.Interfaces;

namespace CarCheck.API.Middleware;

public class DailyQuotaMiddleware
{
    private readonly RequestDelegate _next;

    // Only applies to car search endpoint
    private const string SearchPath = "/api/cars/search";

    public DailyQuotaMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ISearchHistoryRepository searchHistoryRepository, ISubscriptionRepository subscriptionRepository)
    {
        // Only enforce on car search endpoint
        if (!context.Request.Path.StartsWithSegments(SearchPath, StringComparison.OrdinalIgnoreCase)
            || context.Request.Method != HttpMethods.Post)
        {
            await _next(context);
            return;
        }

        var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? context.User.FindFirst("sub")?.Value;

        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
        {
            await _next(context);
            return;
        }

        // Resolve tier-based daily limit
        var subscription = await subscriptionRepository.GetActiveByUserIdAsync(userId);
        var tier = subscription?.Tier ?? SubscriptionTier.Free;
        var limits = TierConfiguration.GetLimits(tier);
        var dailyLimit = limits.DailySearches;

        var todayCount = await searchHistoryRepository.GetCountByUserIdTodayAsync(userId);

        context.Response.Headers["X-DailyQuota-Limit"] = dailyLimit.ToString();
        context.Response.Headers["X-DailyQuota-Remaining"] = Math.Max(0, dailyLimit - todayCount).ToString();
        context.Response.Headers["X-Subscription-Tier"] = tier.ToString();

        if (todayCount >= dailyLimit)
        {
            context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
            await context.Response.WriteAsJsonAsync(new
            {
                error = "Daily search quota exceeded.",
                tier = tier.ToString(),
                limit = dailyLimit,
                used = todayCount,
                resetsAt = DateTime.UtcNow.Date.AddDays(1).ToString("o")
            });
            return;
        }

        await _next(context);
    }
}
