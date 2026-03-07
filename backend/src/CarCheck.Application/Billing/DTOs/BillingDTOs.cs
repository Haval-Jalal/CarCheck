using CarCheck.Domain.Enums;

namespace CarCheck.Application.Billing.DTOs;

public record SubscribeRequest(SubscriptionTier Tier);

public record BuyCreditsRequest(int PackSize);

public record SubscriptionResponse(
    Guid SubscriptionId,
    SubscriptionTier Tier,
    string TierName,
    bool IsActive,
    DateTime StartDate,
    DateTime? EndDate,
    TierLimitsResponse Limits,
    int Credits);

public record TierLimitsResponse(
    int DailySearches,
    int MonthlySearches,
    bool AnalysisIncluded,
    decimal PricePerMonthSek);

public record CheckoutResponse(
    string SessionId,
    string CheckoutUrl);

public record TierInfoResponse(
    SubscriptionTier Tier,
    string Name,
    int DailySearches,
    int MonthlySearches,
    bool AnalysisIncluded,
    decimal PricePerMonthSek);

public record CreditPackResponse(
    int Credits,
    decimal PriceSek,
    string Label,
    bool IsBestValue);

public record CreditsBalanceResponse(
    int Credits,
    bool HasMonthlySubscription);
