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
    private readonly ICreditTransactionRepository _transactionRepository;
    private readonly IEmailService _emailService;

    public SubscriptionService(
        ISubscriptionRepository subscriptionRepository,
        IUserRepository userRepository,
        IBillingProvider billingProvider,
        ISecurityEventLogger securityEventLogger,
        ICreditTransactionRepository transactionRepository,
        IEmailService emailService)
    {
        _subscriptionRepository = subscriptionRepository;
        _userRepository = userRepository;
        _billingProvider = billingProvider;
        _securityEventLogger = securityEventLogger;
        _transactionRepository = transactionRepository;
        _emailService = emailService;
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
            return Result<CheckoutResponse>.Failure("Det går inte att köpa ett gratisabonnemang.");

        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
            return Result<CheckoutResponse>.Failure("Användare hittades inte.");

        var checkout = await _billingProvider.CreateCheckoutSessionAsync(userId, request.Tier, cancellationToken);

        await _securityEventLogger.LogAsync(userId, "CheckoutCreated", cancellationToken: cancellationToken);

        return Result<CheckoutResponse>.Success(new CheckoutResponse(checkout.SessionId, checkout.CheckoutUrl));
    }

    public async Task<Result<CreditsBalanceResponse>> BuyCreditsAsync(
        Guid userId, BuyCreditsRequest request, CancellationToken cancellationToken = default)
    {
        var validPacks = TierConfiguration.CreditPacks.Select(p => p.Credits).ToHashSet();
        if (!validPacks.Contains(request.PackSize))
            return Result<CreditsBalanceResponse>.Failure($"Ogiltigt antal sökningar. Välj bland: {string.Join(", ", validPacks)}.");

        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
            return Result<CreditsBalanceResponse>.Failure("Användare hittades inte.");

        user.AddCredits(request.PackSize);
        await _userRepository.UpdateAsync(user, cancellationToken);

        await _securityEventLogger.LogAsync(userId, "CreditsPurchased", cancellationToken: cancellationToken);

        var subscription = await _subscriptionRepository.GetActiveByUserIdAsync(userId, cancellationToken);
        var hasMonthly = subscription is not null && subscription.IsActive;

        return Result<CreditsBalanceResponse>.Success(new CreditsBalanceResponse(user.Credits, hasMonthly));
    }

    public async Task<Result<CheckoutResponse>> BuyCreditsCheckoutAsync(
        Guid userId, BuyCreditsRequest request, CancellationToken cancellationToken = default)
    {
        var pack = TierConfiguration.CreditPacks.FirstOrDefault(p => p.Credits == request.PackSize);
        if (pack is null)
            return Result<CheckoutResponse>.Failure($"Ogiltigt antal sökningar. Välj bland: {string.Join(", ", TierConfiguration.CreditPacks.Select(p => p.Credits))}.");

        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
            return Result<CheckoutResponse>.Failure("Användare hittades inte.");

        var checkout = await _billingProvider.CreateCreditsCheckoutSessionAsync(userId, pack.Credits, pack.PriceSek, cancellationToken);

        await _securityEventLogger.LogAsync(userId, "CreditsCheckoutCreated", cancellationToken: cancellationToken);

        return Result<CheckoutResponse>.Success(new CheckoutResponse(checkout.SessionId, checkout.CheckoutUrl));
    }

    public async Task<Result<bool>> GrantCreditsAsync(
        Guid userId, int credits, CancellationToken cancellationToken = default,
        string? externalPaymentId = null)
    {
        // Idempotency: skip if this payment was already processed
        if (externalPaymentId is not null &&
            await _transactionRepository.ExistsByExternalPaymentIdAsync(externalPaymentId, cancellationToken))
            return Result<bool>.Success(true);

        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
            return Result<bool>.Failure("Användare hittades inte.");

        user.AddCredits(credits);
        await _userRepository.UpdateAsync(user, cancellationToken);

        var pack = TierConfiguration.CreditPacks.FirstOrDefault(p => p.Credits == credits);
        var amountOre = pack is not null ? (int)(pack.PriceSek * 100) : 0;
        await _transactionRepository.AddAsync(
            CreditTransaction.CreateCredits(userId, credits, amountOre, externalPaymentId),
            cancellationToken);

        await _securityEventLogger.LogAsync(userId, "CreditsGranted", cancellationToken: cancellationToken);

        try
        {
            await _emailService.SendCreditsPurchaseConfirmationAsync(
                user.Email.Value, credits, amountOre / 100m, cancellationToken);
        }
        catch (Exception ex)
        {
            // Non-fatal: log but don't fail the purchase
            _ = ex;
        }

        return Result<bool>.Success(true);
    }

    public async Task<Result<SubscriptionResponse>> ActivateSubscriptionAsync(
        Guid userId, SubscriptionTier tier, string externalSubscriptionId, CancellationToken cancellationToken = default,
        string? externalPaymentId = null)
    {
        // Idempotency: skip if this payment was already processed
        if (externalPaymentId is not null &&
            await _transactionRepository.ExistsByExternalPaymentIdAsync(externalPaymentId, cancellationToken))
        {
            var existing2 = await _subscriptionRepository.GetActiveByUserIdAsync(userId, cancellationToken);
            var user2 = await _userRepository.GetByIdAsync(userId, cancellationToken);
            var limits2 = TierConfiguration.GetLimits(tier);
            return Result<SubscriptionResponse>.Success(new SubscriptionResponse(
                existing2?.Id ?? Guid.Empty, tier, limits2.Name, true,
                existing2?.StartDate ?? DateTime.UtcNow, null, MapLimits(limits2), user2?.Credits ?? 0));
        }

        var existing = await _subscriptionRepository.GetActiveByUserIdAsync(userId, cancellationToken);
        if (existing is not null)
        {
            existing.Cancel();
            await _subscriptionRepository.UpdateAsync(existing, cancellationToken);
        }

        var subscription = Subscription.Create(userId, tier, externalSubscriptionId);
        await _subscriptionRepository.AddAsync(subscription, cancellationToken);

        await _transactionRepository.AddAsync(
            CreditTransaction.CreateSubscription(userId, 49900, externalPaymentId),
            cancellationToken);

        await _securityEventLogger.LogAsync(userId, "SubscriptionActivated", cancellationToken: cancellationToken);

        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);

        if (user is not null)
        {
            try { await _emailService.SendSubscriptionConfirmationAsync(user.Email.Value, cancellationToken); }
            catch (Exception ex) { _ = ex; }
        }

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
            return Result<bool>.Failure("Inget aktivt abonnemang hittades.");

        if (subscription.ExternalSubscriptionId is not null)
        {
            try
            {
                await _billingProvider.CancelSubscriptionAsync(subscription.ExternalSubscriptionId, cancellationToken);
            }
            catch
            {
                // Log and continue — DB cancel still happens even if Stripe call fails.
                // Stripe inconsistencies can be reconciled via dashboard.
            }
        }

        subscription.Cancel();
        await _subscriptionRepository.UpdateAsync(subscription, cancellationToken);

        await _securityEventLogger.LogAsync(userId, "SubscriptionCancelled", cancellationToken: cancellationToken);

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

    public async Task<Result<IReadOnlyList<TransactionResponse>>> GetTransactionsAsync(
        Guid userId, CancellationToken cancellationToken = default)
    {
        var transactions = await _transactionRepository.GetByUserIdAsync(userId, cancellationToken);
        var result = transactions
            .Select(t => new TransactionResponse(
                t.Id,
                t.Type,
                t.Credits,
                t.AmountOre / 100m,
                t.Description,
                t.CreatedAt))
            .ToList();

        return Result<IReadOnlyList<TransactionResponse>>.Success(result);
    }

    private static TierLimitsResponse MapLimits(TierLimits limits) =>
        new(limits.DailySearches, limits.MonthlySearches, limits.AnalysisIncluded, limits.PricePerMonthSek);
}
