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
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        var credits = user?.Credits ?? 0;

        var subscription = await _subscriptionRepository.GetActiveByUserIdAsync(userId, cancellationToken);

        if (subscription is null)
        {
            var freeLimits = TierConfiguration.GetLimits(SubscriptionTier.Free);
            return Result<SubscriptionResponse>.Success(new SubscriptionResponse(
                Guid.Empty,
                SubscriptionTier.Free,
                freeLimits.Name,
                true,
                DateTime.UtcNow,
                null,
                MapLimits(freeLimits),
                credits));
        }

        var limits = TierConfiguration.GetLimits(subscription.Tier);
        return Result<SubscriptionResponse>.Success(new SubscriptionResponse(
            subscription.Id,
            subscription.Tier,
            limits.Name,
            subscription.IsActive,
            subscription.StartDate,
            subscription.EndDate,
            MapLimits(limits),
            credits));
    }

    public async Task<Result<CheckoutResponse>> CreateCheckoutAsync(
        Guid userId, SubscribeRequest request, CancellationToken cancellationToken = default)
    {
        if (request.Tier == SubscriptionTier.Free)
            return Result<CheckoutResponse>.Failure("Cannot purchase a free subscription.");

        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
            return Result<CheckoutResponse>.Failure("User not found.");

        var checkout = await _billingProvider.CreateCheckoutSessionAsync(userId, request.Tier, cancellationToken);

        await _securityEventLogger.LogAsync(userId, "CheckoutCreated", null, cancellationToken);

        return Result<CheckoutResponse>.Success(new CheckoutResponse(checkout.SessionId, checkout.CheckoutUrl));
    }

    public async Task<Result<CreditsBalanceResponse>> BuyCreditsAsync(
        Guid userId, BuyCreditsRequest request, CancellationToken cancellationToken = default)
    {
        var validPacks = TierConfiguration.CreditPacks.Select(p => p.Credits).ToHashSet();
        if (!validPacks.Contains(request.PackSize))
            return Result<CreditsBalanceResponse>.Failure($"Invalid pack size. Choose from: {string.Join(", ", validPacks)}.");

        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
            return Result<CreditsBalanceResponse>.Failure("User not found.");

        user.AddCredits(request.PackSize);
        await _userRepository.UpdateAsync(user, cancellationToken);

        await _securityEventLogger.LogAsync(userId, "CreditsPurchased", null, cancellationToken);

        var subscription = await _subscriptionRepository.GetActiveByUserIdAsync(userId, cancellationToken);
        var hasMonthly = subscription is not null && subscription.IsActive;

        return Result<CreditsBalanceResponse>.Success(new CreditsBalanceResponse(user.Credits, hasMonthly));
    }

    public async Task<Result<CheckoutResponse>> BuyCreditsCheckoutAsync(
        Guid userId, BuyCreditsRequest request, CancellationToken cancellationToken = default)
    {
        var pack = TierConfiguration.CreditPacks.FirstOrDefault(p => p.Credits == request.PackSize);
        if (pack is null)
            return Result<CheckoutResponse>.Failure($"Invalid pack size. Choose from: {string.Join(", ", TierConfiguration.CreditPacks.Select(p => p.Credits))}.");

        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
            return Result<CheckoutResponse>.Failure("User not found.");

        var checkout = await _billingProvider.CreateCreditsCheckoutSessionAsync(userId, pack.Credits, pack.PriceSek, cancellationToken);

        await _securityEventLogger.LogAsync(userId, "CreditsCheckoutCreated", null, cancellationToken);

        return Result<CheckoutResponse>.Success(new CheckoutResponse(checkout.SessionId, checkout.CheckoutUrl));
    }

    public async Task<Result<bool>> GrantCreditsAsync(
        Guid userId, int credits, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
            return Result<bool>.Failure("User not found.");

        user.AddCredits(credits);
        await _userRepository.UpdateAsync(user, cancellationToken);

        await _securityEventLogger.LogAsync(userId, "CreditsGranted", null, cancellationToken);

        return Result<bool>.Success(true);
    }

    public async Task<Result<SubscriptionResponse>> ActivateSubscriptionAsync(
        Guid userId, SubscriptionTier tier, string externalSubscriptionId, CancellationToken cancellationToken = default)
    {
        var existing = await _subscriptionRepository.GetActiveByUserIdAsync(userId, cancellationToken);
        if (existing is not null)
        {
            existing.Cancel();
            await _subscriptionRepository.UpdateAsync(existing, cancellationToken);
        }

        var subscription = Subscription.Create(userId, tier, externalSubscriptionId);
        await _subscriptionRepository.AddAsync(subscription, cancellationToken);

        await _securityEventLogger.LogAsync(userId, "SubscriptionActivated", null, cancellationToken);

        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        var limits = TierConfiguration.GetLimits(tier);
        return Result<SubscriptionResponse>.Success(new SubscriptionResponse(
            subscription.Id,
            tier,
            limits.Name,
            true,
            subscription.StartDate,
            null,
            MapLimits(limits),
            user?.Credits ?? 0));
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

    public IReadOnlyList<CreditPackResponse> GetCreditPackages()
    {
        var packs = TierConfiguration.CreditPacks;
        return packs.Select((p, i) => new CreditPackResponse(
            p.Credits,
            p.PriceSek,
            $"{p.Credits} {(p.Credits == 1 ? "sökning" : "sökningar")}",
            i == packs.Count - 1)).ToList();
    }

    public IReadOnlyList<TierInfoResponse> GetAvailableTiers()
    {
        return new[] { SubscriptionTier.Free, SubscriptionTier.Pro }
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
