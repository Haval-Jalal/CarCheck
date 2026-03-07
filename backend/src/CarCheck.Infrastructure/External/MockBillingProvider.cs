using CarCheck.Application.Interfaces;
using CarCheck.Domain.Enums;

namespace CarCheck.Infrastructure.External;

/// <summary>
/// Mock billing provider for development. Replace with Stripe/Klarna integration in production.
/// </summary>
public class MockBillingProvider : IBillingProvider
{
    public Task<CreateCheckoutResult> CreateCheckoutSessionAsync(
        Guid userId, SubscriptionTier tier, CancellationToken cancellationToken = default)
    {
        var sessionId = $"mock_session_{Guid.NewGuid():N}";
        var checkoutUrl = $"https://mock-billing.local/checkout/{sessionId}";

        return Task.FromResult(new CreateCheckoutResult(sessionId, checkoutUrl));
    }

    public Task<bool> CancelSubscriptionAsync(string externalSubscriptionId, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(true);
    }

    public Task<SubscriptionStatus?> GetSubscriptionStatusAsync(
        string externalSubscriptionId, CancellationToken cancellationToken = default)
    {
        return Task.FromResult<SubscriptionStatus?>(new SubscriptionStatus(
            externalSubscriptionId,
            IsActive: true,
            CurrentPeriodEnd: DateTime.UtcNow.AddDays(30)));
    }
}
