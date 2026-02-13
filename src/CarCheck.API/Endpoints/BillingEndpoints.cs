using System.Security.Claims;
using CarCheck.Application.Billing;
using CarCheck.Application.Billing.DTOs;

namespace CarCheck.API.Endpoints;

public static class BillingEndpoints
{
    public static void MapBillingEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/billing").WithTags("Billing");

        group.MapGet("/tiers", (SubscriptionService subscriptionService) =>
        {
            var tiers = subscriptionService.GetAvailableTiers();
            return Results.Ok(tiers);
        })
        .WithName("GetTiers")
        .AllowAnonymous();

        group.MapGet("/subscription", async (SubscriptionService subscriptionService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var result = await subscriptionService.GetCurrentSubscriptionAsync(userId.Value);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("GetSubscription")
        .RequireAuthorization();

        group.MapPost("/checkout", async (SubscribeRequest request, SubscriptionService subscriptionService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var result = await subscriptionService.CreateCheckoutAsync(userId.Value, request);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("CreateCheckout")
        .RequireAuthorization();

        group.MapPost("/cancel", async (SubscriptionService subscriptionService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var result = await subscriptionService.CancelSubscriptionAsync(userId.Value);
            return result.IsSuccess
                ? Results.Ok(new { message = "Subscription cancelled." })
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("CancelSubscription")
        .RequireAuthorization();
    }

    private static Guid? GetUserId(ClaimsPrincipal user)
    {
        var claim = user.FindFirst(ClaimTypes.NameIdentifier)
            ?? user.FindFirst("sub");

        return claim is not null && Guid.TryParse(claim.Value, out var id) ? id : null;
    }
}
