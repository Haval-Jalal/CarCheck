using System.Security.Claims;
using CarCheck.Application.Billing.DTOs;
using CarCheck.Domain.Enums;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Stripe;
using AppSubscriptionService = CarCheck.Application.Billing.SubscriptionService;

namespace CarCheck.API.Endpoints;

public static class BillingEndpoints
{
    public static void MapBillingEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/billing").WithTags("Billing");

        group.MapGet("/tiers", (AppSubscriptionService subscriptionService) =>
        {
            var tiers = subscriptionService.GetAvailableTiers();
            return Results.Ok(tiers);
        })
        .WithName("GetTiers")
        .AllowAnonymous();

        group.MapGet("/credit-packages", (AppSubscriptionService subscriptionService) =>
        {
            var packages = subscriptionService.GetCreditPackages();
            return Results.Ok(packages);
        })
        .WithName("GetCreditPackages")
        .AllowAnonymous();

        group.MapGet("/subscription", async (AppSubscriptionService subscriptionService, ClaimsPrincipal user) =>
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

        group.MapPost("/checkout", async (SubscribeRequest request, AppSubscriptionService subscriptionService, ClaimsPrincipal user) =>
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

        group.MapPost("/buy-credits", async (BuyCreditsRequest request, AppSubscriptionService subscriptionService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var result = await subscriptionService.BuyCreditsAsync(userId.Value, request);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("BuyCredits")
        .RequireAuthorization();

        group.MapPost("/cancel", async (AppSubscriptionService subscriptionService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var result = await subscriptionService.CancelSubscriptionAsync(userId.Value);
            return result.IsSuccess
                ? Results.Ok(new { message = "Abonnemanget har avslutats." })
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("CancelSubscription")
        .RequireAuthorization();

        group.MapGet("/transactions", async (AppSubscriptionService subscriptionService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var result = await subscriptionService.GetTransactionsAsync(userId.Value);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("GetTransactions")
        .RequireAuthorization();

        group.MapPost("/credits-checkout", async (BuyCreditsRequest request, AppSubscriptionService subscriptionService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var result = await subscriptionService.BuyCreditsCheckoutAsync(userId.Value, request);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("BuyCreditsCheckout")
        .RequireAuthorization();

        group.MapPost("/webhook", async (HttpRequest request, AppSubscriptionService subscriptionService, IConfiguration config, ILoggerFactory loggerFactory) =>
        {
            var logger = loggerFactory.CreateLogger("BillingWebhook");
            string json;
            using (var reader = new StreamReader(request.Body))
                json = await reader.ReadToEndAsync();

            var webhookSecret = config["Stripe:WebhookSecret"];
            if (string.IsNullOrEmpty(webhookSecret))
            {
                logger.LogError("Stripe:WebhookSecret is not configured — rejecting webhook");
                return Results.StatusCode(500);
            }

            Event stripeEvent;
            try
            {
                var signature = request.Headers["Stripe-Signature"].ToString();
                stripeEvent = EventUtility.ConstructEvent(json, signature, webhookSecret);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Stripe webhook signature validation failed");
                return Results.BadRequest();
            }

            if (stripeEvent.Type == EventTypes.CheckoutSessionCompleted)
            {
                var session = stripeEvent.Data.Object as Stripe.Checkout.Session;
                if (session?.Metadata?.TryGetValue("userId", out var userIdStr) == true
                    && Guid.TryParse(userIdStr, out var userId))
                {
                    session.Metadata.TryGetValue("type", out var type);
                    var paymentId = session.Id; // Stripe session ID as idempotency key

                    if (type == "subscription" && session.SubscriptionId is not null)
                    {
                        await subscriptionService.ActivateSubscriptionAsync(
                            userId, SubscriptionTier.Pro, session.SubscriptionId,
                            externalPaymentId: paymentId);
                    }
                    else if (type == "credits"
                        && session.Metadata.TryGetValue("credits", out var creditsStr)
                        && int.TryParse(creditsStr, out var credits))
                    {
                        await subscriptionService.GrantCreditsAsync(
                            userId, credits, externalPaymentId: paymentId);
                    }
                }
            }

            return Results.Ok();
        })
        .WithName("StripeWebhook")
        .AllowAnonymous();
    }

    private static Guid? GetUserId(ClaimsPrincipal user)
    {
        var claim = user.FindFirst(ClaimTypes.NameIdentifier)
            ?? user.FindFirst("sub");

        return claim is not null && Guid.TryParse(claim.Value, out var id) ? id : null;
    }
}
