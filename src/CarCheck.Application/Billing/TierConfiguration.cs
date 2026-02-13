using CarCheck.Domain.Enums;

namespace CarCheck.Application.Billing;

public static class TierConfiguration
{
    public static TierLimits GetLimits(SubscriptionTier tier) => tier switch
    {
        SubscriptionTier.Free => new TierLimits(
            DailySearches: 5,
            MonthlySearches: 50,
            AnalysisIncluded: false,
            PricePerMonthSek: 0m,
            Name: "Free"),

        SubscriptionTier.Pro => new TierLimits(
            DailySearches: 50,
            MonthlySearches: 500,
            AnalysisIncluded: true,
            PricePerMonthSek: 99m,
            Name: "Pro"),

        SubscriptionTier.Premium => new TierLimits(
            DailySearches: int.MaxValue,
            MonthlySearches: int.MaxValue,
            AnalysisIncluded: true,
            PricePerMonthSek: 249m,
            Name: "Premium"),

        _ => throw new ArgumentOutOfRangeException(nameof(tier))
    };
}

public record TierLimits(
    int DailySearches,
    int MonthlySearches,
    bool AnalysisIncluded,
    decimal PricePerMonthSek,
    string Name);
