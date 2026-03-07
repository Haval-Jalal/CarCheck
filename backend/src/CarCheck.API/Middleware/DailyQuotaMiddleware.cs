using System.Security.Claims;
using CarCheck.Application.Billing;
using CarCheck.Domain.Enums;
using CarCheck.Domain.Interfaces;

namespace CarCheck.API.Middleware;

public class DailyQuotaMiddleware
{
    private readonly RequestDelegate _next;

    private const string SearchPath = "/api/cars/search";

    public DailyQuotaMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(
        HttpContext context,
        ISearchHistoryRepository searchHistoryRepository,
        ISubscriptionRepository subscriptionRepository,
        IUserRepository userRepository)
    {
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

        var subscription = await subscriptionRepository.GetActiveByUserIdAsync(userId);
        var hasMonthly = subscription is not null && subscription.IsActive;

        if (hasMonthly)
        {
            // Unlimited monthly plan
            context.Response.Headers["X-DailyQuota-Limit"] = "unlimited";
            context.Response.Headers["X-DailyQuota-Remaining"] = "unlimited";
            context.Response.Headers["X-Subscription-Tier"] = subscription!.Tier.ToString();
            await _next(context);
            return;
        }

        var user = await userRepository.GetByIdAsync(userId);

        if (user is not null && user.Credits > 0)
        {
            // Credit-based access
            context.Response.Headers["X-DailyQuota-Limit"] = "credits";
            context.Response.Headers["X-DailyQuota-Remaining"] = user.Credits.ToString();
            context.Response.Headers["X-Subscription-Tier"] = SubscriptionTier.Free.ToString();

            await _next(context);

            // Deduct 1 credit after a successful search
            if (context.Response.StatusCode is >= 200 and < 300)
            {
                user.ConsumeCredit();
                await userRepository.UpdateAsync(user);
            }
            return;
        }

        // Free tier: limited daily searches
        var todayCount = await searchHistoryRepository.GetCountByUserIdTodayAsync(userId);
        var freeLimit = TierConfiguration.FreeDaily;

        context.Response.Headers["X-DailyQuota-Limit"] = freeLimit.ToString();
        context.Response.Headers["X-DailyQuota-Remaining"] = Math.Max(0, freeLimit - todayCount).ToString();
        context.Response.Headers["X-Subscription-Tier"] = SubscriptionTier.Free.ToString();

        if (todayCount >= freeLimit)
        {
            context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
            await context.Response.WriteAsJsonAsync(new
            {
                error = "Du har använt dina gratis sökningar för idag. Köp sökningar eller teckna ett abonnemang.",
                tier = SubscriptionTier.Free.ToString(),
                limit = freeLimit,
                used = todayCount,
                resetsAt = DateTime.UtcNow.Date.AddDays(1).ToString("o")
            });
            return;
        }

        await _next(context);
    }
}
