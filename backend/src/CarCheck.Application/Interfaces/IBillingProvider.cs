using CarCheck.Domain.Enums;

namespace CarCheck.Application.Interfaces;

public interface IBillingProvider
{
    Task<CreateCheckoutResult> CreateCheckoutSessionAsync(Guid userId, SubscriptionTier tier, CancellationToken cancellationToken = default);
    Task<bool> CancelSubscriptionAsync(string externalSubscriptionId, CancellationToken cancellationToken = default);
    Task<SubscriptionStatus?> GetSubscriptionStatusAsync(string externalSubscriptionId, CancellationToken cancellationToken = default);
}

public record CreateCheckoutResult(
    string SessionId,
    string CheckoutUrl);

public record SubscriptionStatus(
    string ExternalId,
    bool IsActive,
    DateTime? CurrentPeriodEnd);
