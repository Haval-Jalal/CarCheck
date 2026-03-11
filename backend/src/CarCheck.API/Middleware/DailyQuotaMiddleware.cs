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
            context.Response.Headers["X-DailyQuota-Limit"] = "unlimited";
            context.Response.Headers["X-DailyQuota-Remaining"] = "unlimited";
            context.Response.Headers["X-Subscription-Tier"] = subscription!.Tier.ToString();
            await _next(context);
            return;
        }

        var user = await userRepository.GetByIdAsync(userId);

        // Block unverified users
        if (user is not null && !user.EmailVerified)
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(new
            {
                error = "Du måste verifiera din e-postadress innan du kan söka. Kolla din inkorg.",
                requiresEmailVerification = true
            });
            return;
        }

        if (user is not null && user.Credits > 0)
        {
            context.Response.Headers["X-DailyQuota-Limit"] = "credits";
            context.Response.Headers["X-DailyQuota-Remaining"] = user.Credits.ToString();
            context.Response.Headers["X-Subscription-Tier"] = SubscriptionTier.Free.ToString();

            await _next(context);

            if (context.Response.StatusCode is >= 200 and < 300)
            {
                user.ConsumeCredit();
                await userRepository.UpdateAsync(user);
            }
            return;
        }

        // No credits, no subscription → blocked
        context.Response.StatusCode = StatusCodes.Status402PaymentRequired;
        await context.Response.WriteAsJsonAsync(new
        {
            error = "Du har inga sökningar kvar. Köp sökningar eller teckna ett abonnemang.",
            tier = SubscriptionTier.Free.ToString()
        });
    }
}
