using CarCheck.Domain.Enums;

namespace CarCheck.Application.Billing;

public static class TierConfiguration
{
    public const int FreeDaily = 3;

    public static TierLimits GetLimits(SubscriptionTier tier) => tier switch
    {
        SubscriptionTier.Free => new TierLimits(
            DailySearches: FreeDaily,
            MonthlySearches: 90,
            AnalysisIncluded: true,
            PricePerMonthSek: 0m,
            Name: "Gratis"),

        SubscriptionTier.Pro => new TierLimits(
            DailySearches: int.MaxValue,
            MonthlySearches: int.MaxValue,
            AnalysisIncluded: true,
            PricePerMonthSek: 499m,
            Name: "Månatlig"),

        SubscriptionTier.Premium => new TierLimits(
            DailySearches: int.MaxValue,
            MonthlySearches: int.MaxValue,
            AnalysisIncluded: true,
            PricePerMonthSek: 499m,
            Name: "Månatlig"),

        _ => throw new ArgumentOutOfRangeException(nameof(tier))
    };

    public static IReadOnlyList<CreditPack> CreditPacks { get; } =
    [
        new CreditPack(1, 19m),
        new CreditPack(7, 99m),
        new CreditPack(20, 249m),
    ];
}

public record TierLimits(
    int DailySearches,
    int MonthlySearches,
    bool AnalysisIncluded,
    decimal PricePerMonthSek,
    string Name);

public record CreditPack(int Credits, decimal PriceSek);
