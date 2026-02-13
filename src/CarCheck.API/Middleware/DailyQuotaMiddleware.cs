using System.Security.Claims;
using CarCheck.Domain.Interfaces;

namespace CarCheck.API.Middleware;

public class DailyQuotaMiddleware
{
    private readonly RequestDelegate _next;
    private const int FreeSearchesPerDay = 5;

    // Only applies to car search endpoint
    private const string SearchPath = "/api/cars/search";

    public DailyQuotaMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ISearchHistoryRepository searchHistoryRepository)
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

        var todayCount = await searchHistoryRepository.GetCountByUserIdTodayAsync(userId);

        context.Response.Headers["X-DailyQuota-Limit"] = FreeSearchesPerDay.ToString();
        context.Response.Headers["X-DailyQuota-Remaining"] = Math.Max(0, FreeSearchesPerDay - todayCount).ToString();

        if (todayCount >= FreeSearchesPerDay)
        {
            context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
            await context.Response.WriteAsJsonAsync(new
            {
                error = "Daily search quota exceeded.",
                limit = FreeSearchesPerDay,
                used = todayCount,
                resetsAt = DateTime.UtcNow.Date.AddDays(1).ToString("o")
            });
            return;
        }

        await _next(context);
    }
}
