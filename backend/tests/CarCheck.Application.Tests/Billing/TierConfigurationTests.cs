using CarCheck.Application.Billing;
using CarCheck.Domain.Enums;

namespace CarCheck.Application.Tests.Billing;

public class TierConfigurationTests
{
    [Fact]
    public void FreeTier_HasCorrectLimits()
    {
        var limits = TierConfiguration.GetLimits(SubscriptionTier.Free);

        Assert.Equal(3, limits.DailySearches);
        Assert.Equal(90, limits.MonthlySearches);
        Assert.True(limits.AnalysisIncluded);
        Assert.Equal(0m, limits.PricePerMonthSek);
        Assert.Equal("Gratis", limits.Name);
    }

    [Fact]
    public void ProTier_HasCorrectLimits()
    {
        var limits = TierConfiguration.GetLimits(SubscriptionTier.Pro);

        Assert.Equal(int.MaxValue, limits.DailySearches);
        Assert.Equal(int.MaxValue, limits.MonthlySearches);
        Assert.True(limits.AnalysisIncluded);
        Assert.Equal(499m, limits.PricePerMonthSek);
    }

    [Fact]
    public void PremiumTier_HasUnlimitedSearches()
    {
        var limits = TierConfiguration.GetLimits(SubscriptionTier.Premium);

        Assert.Equal(int.MaxValue, limits.DailySearches);
        Assert.Equal(int.MaxValue, limits.MonthlySearches);
        Assert.True(limits.AnalysisIncluded);
        Assert.Equal(499m, limits.PricePerMonthSek);
    }
}
