namespace CarCheck.Domain.Enums;

public enum SubscriptionTier
{
    // Consumer tiers
    Free = 0,
    Pro = 1,
    Premium = 2,
    Business = 3,

    // B2B company tiers
    DealerBasic = 4,   // 1 seat, 50 reports/month — 399 kr/month
    DealerTeam = 5,    // 5 seats, 200 reports/month — 999 kr/month
    Fleet = 6,         // unlimited + fleet monitoring — 1 499 kr/month
    Workshop = 7       // unlimited + workshop intake mode — 299 kr/month
}
