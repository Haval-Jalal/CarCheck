using CarCheck.Application.Auth;
using CarCheck.Application.Billing.DTOs;
using CarCheck.Application.Interfaces;
using CarCheck.Domain.Entities;
using CarCheck.Domain.Enums;
using CarCheck.Domain.Interfaces;

namespace CarCheck.Application.Billing;

public class SubscriptionService
{
    private readonly ISubscriptionRepository _subscriptionRepository;
    private readonly IUserRepository _userRepository;
    private readonly IBillingProvider _billingProvider;
    private readonly ISecurityEventLogger _securityEventLogger;

    public SubscriptionService(
        ISubscriptionRepository subscriptionRepository,
        IUserRepository userRepository,
        IBillingProvider billingProvider,
        ISecurityEventLogger securityEventLogger)
    {
        _subscriptionRepository = subscriptionRepository;
        _userRepository = userRepository;
        _billingProvider = billingProvider;
        _securityEventLogger = securityEventLogger;
    }

    public async Task<Result<SubscriptionResponse>> GetCurrentSubscriptionAsync(
        Guid userId, CancellationToken cancellationToken = default)
    {
        var subscription = await _subscriptionRepository.GetActiveByUserIdAsync(userId, cancellationToken);

        if (subscription is null)
        {
            // Return free tier info
            var freeLimits = TierConfiguration.GetLimits(SubscriptionTier.Free);
            return Result<SubscriptionResponse>.Success(new SubscriptionResponse(
                Guid.Empty,
                SubscriptionTier.Free,
                freeLimits.Name,
                true,
                DateTime.UtcNow,
                null,
                MapLimits(freeLimits)));
        }

        var limits = TierConfiguration.GetLimits(subscription.Tier);
        return Result<SubscriptionResponse>.Success(new SubscriptionResponse(
            subscription.Id,
            subscription.Tier,
            limits.Name,
            subscription.IsActive,
            subscription.StartDate,
            subscription.EndDate,
            MapLimits(limits)));
    }

    public async Task<Result<CheckoutResponse>> CreateCheckoutAsync(
        Guid userId, SubscribeRequest request, CancellationToken cancellationToken = default)
    {
        if (request.Tier == SubscriptionTier.Free)
            return Result<CheckoutResponse>.Failure("Cannot purchase a free subscription.");

        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
            return Result<CheckoutResponse>.Failure("User not found.");

        var existing = await _subscriptionRepository.GetActiveByUserIdAsync(userId, cancellationToken);
        if (existing is not null && existing.Tier >= request.Tier)
            return Result<CheckoutResponse>.Failure($"You already have a {existing.Tier} subscription.");

        var checkout = await _billingProvider.CreateCheckoutSessionAsync(userId, request.Tier, cancellationToken);

        await _securityEventLogger.LogAsync(userId, "CheckoutCreated", null, cancellationToken);

        return Result<CheckoutResponse>.Success(new CheckoutResponse(checkout.SessionId, checkout.CheckoutUrl));
    }

    public async Task<Result<SubscriptionResponse>> ActivateSubscriptionAsync(
        Guid userId, SubscriptionTier tier, string externalSubscriptionId, CancellationToken cancellationToken = default)
    {
        // Cancel any existing active subscription
        var existing = await _subscriptionRepository.GetActiveByUserIdAsync(userId, cancellationToken);
        if (existing is not null)
        {
            existing.Cancel();
            await _subscriptionRepository.UpdateAsync(existing, cancellationToken);
        }

        var subscription = Subscription.Create(userId, tier, externalSubscriptionId);
        await _subscriptionRepository.AddAsync(subscription, cancellationToken);

        await _securityEventLogger.LogAsync(userId, "SubscriptionActivated", null, cancellationToken);

        var limits = TierConfiguration.GetLimits(tier);
        return Result<SubscriptionResponse>.Success(new SubscriptionResponse(
            subscription.Id,
            tier,
            limits.Name,
            true,
            subscription.StartDate,
            null,
            MapLimits(limits)));
    }

    public async Task<Result<bool>> CancelSubscriptionAsync(
        Guid userId, CancellationToken cancellationToken = default)
    {
        var subscription = await _subscriptionRepository.GetActiveByUserIdAsync(userId, cancellationToken);
        if (subscription is null)
            return Result<bool>.Failure("No active subscription found.");

        if (subscription.ExternalSubscriptionId is not null)
            await _billingProvider.CancelSubscriptionAsync(subscription.ExternalSubscriptionId, cancellationToken);

        subscription.Cancel();
        await _subscriptionRepository.UpdateAsync(subscription, cancellationToken);

        await _securityEventLogger.LogAsync(userId, "SubscriptionCancelled", null, cancellationToken);

        return Result<bool>.Success(true);
    }

    public IReadOnlyList<TierInfoResponse> GetAvailableTiers()
    {
        return Enum.GetValues<SubscriptionTier>()
            .Select(tier =>
            {
                var limits = TierConfiguration.GetLimits(tier);
                return new TierInfoResponse(
                    tier,
                    limits.Name,
                    limits.DailySearches,
                    limits.MonthlySearches,
                    limits.AnalysisIncluded,
                    limits.PricePerMonthSek);
            })
            .ToList();
    }

    private static TierLimitsResponse MapLimits(TierLimits limits) =>
        new(limits.DailySearches, limits.MonthlySearches, limits.AnalysisIncluded, limits.PricePerMonthSek);
}
