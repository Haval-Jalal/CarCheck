using CarCheck.Application.Interfaces;
using CarCheck.Domain.Enums;
using Microsoft.Extensions.Configuration;
using Stripe;
using Stripe.Checkout;
using StripeSubService = Stripe.SubscriptionService;

namespace CarCheck.Infrastructure.External;

public class StripeBillingProvider : IBillingProvider
{
    private readonly StripeClient _client;
    private readonly string _frontendBaseUrl;

    public StripeBillingProvider(IConfiguration configuration)
    {
        var secretKey = configuration["Stripe:SecretKey"]
            ?? throw new InvalidOperationException("Stripe:SecretKey is not configured.");
        _client = new StripeClient(secretKey);
        _frontendBaseUrl = configuration["Frontend:BaseUrl"] ?? "http://localhost:5173";
    }

    public async Task<CreateCheckoutResult> CreateCheckoutSessionAsync(
        Guid userId, SubscriptionTier tier, CancellationToken cancellationToken = default)
    {
        var service = new SessionService(_client);
        var options = new SessionCreateOptions
        {
            Mode = "subscription",
            LineItems =
            [
                new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        UnitAmount = 49900, // 499 SEK in öre
                        Currency = "sek",
                        Recurring = new SessionLineItemPriceDataRecurringOptions { Interval = "month" },
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = "CarCheck Månadsplan",
                            Description = "Obegränsade bilsökningar per månad"
                        }
                    },
                    Quantity = 1
                }
            ],
            Metadata = new Dictionary<string, string>
            {
                ["userId"] = userId.ToString(),
                ["type"] = "subscription"
            },
            SuccessUrl = $"{_frontendBaseUrl}/billing?success=true",
            CancelUrl = $"{_frontendBaseUrl}/billing?canceled=true"
        };

        var session = await service.CreateAsync(options, cancellationToken: cancellationToken);
        return new CreateCheckoutResult(session.Id, session.Url);
    }

    public async Task<CreateCheckoutResult> CreateCreditsCheckoutSessionAsync(
        Guid userId, int credits, decimal priceSek, CancellationToken cancellationToken = default)
    {
        var unitAmount = (long)(priceSek * 100); // SEK → öre
        var service = new SessionService(_client);
        var options = new SessionCreateOptions
        {
            Mode = "payment",
            LineItems =
            [
                new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        UnitAmount = unitAmount,
                        Currency = "sek",
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = $"CarCheck — {credits} {(credits == 1 ? "sökning" : "sökningar")}",
                            Description = "Engångsköp av bilsökningar"
                        }
                    },
                    Quantity = 1
                }
            ],
            Metadata = new Dictionary<string, string>
            {
                ["userId"] = userId.ToString(),
                ["type"] = "credits",
                ["credits"] = credits.ToString()
            },
            SuccessUrl = $"{_frontendBaseUrl}/billing?success=true&credits={credits}",
            CancelUrl = $"{_frontendBaseUrl}/billing?canceled=true"
        };

        var session = await service.CreateAsync(options, cancellationToken: cancellationToken);
        return new CreateCheckoutResult(session.Id, session.Url);
    }

    public async Task<bool> CancelSubscriptionAsync(
        string externalSubscriptionId, CancellationToken cancellationToken = default)
    {
        var service = new StripeSubService(_client);
        await service.UpdateAsync(externalSubscriptionId,
            new SubscriptionUpdateOptions { CancelAtPeriodEnd = true },
            cancellationToken: cancellationToken);
        return true;
    }

    public async Task<SubscriptionStatus?> GetSubscriptionStatusAsync(
        string externalSubscriptionId, CancellationToken cancellationToken = default)
    {
        var service = new StripeSubService(_client);
        var subscription = await service.GetAsync(externalSubscriptionId, cancellationToken: cancellationToken);
        if (subscription is null) return null;
        return new Application.Interfaces.SubscriptionStatus(
            subscription.Id,
            subscription.Status == "active",
            null);
    }
}
