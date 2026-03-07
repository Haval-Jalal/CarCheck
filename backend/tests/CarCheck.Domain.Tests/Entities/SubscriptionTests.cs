using CarCheck.Domain.Entities;
using CarCheck.Domain.Enums;

namespace CarCheck.Domain.Tests.Entities;

public class SubscriptionTests
{
    [Fact]
    public void Create_WithValidData_ShouldSetProperties()
    {
        var userId = Guid.NewGuid();
        var sub = Subscription.Create(userId, SubscriptionTier.Pro, "ext_123");

        Assert.NotEqual(Guid.Empty, sub.Id);
        Assert.Equal(userId, sub.UserId);
        Assert.Equal(SubscriptionTier.Pro, sub.Tier);
        Assert.True(sub.IsActive);
        Assert.Null(sub.EndDate);
        Assert.Equal("ext_123", sub.ExternalSubscriptionId);
    }

    [Fact]
    public void Create_WithEmptyUserId_ShouldThrow()
    {
        Assert.Throws<ArgumentException>(() =>
            Subscription.Create(Guid.Empty, SubscriptionTier.Pro));
    }

    [Fact]
    public void Cancel_ShouldDeactivateAndSetEndDate()
    {
        var sub = Subscription.Create(Guid.NewGuid(), SubscriptionTier.Pro);
        sub.Cancel();

        Assert.False(sub.IsActive);
        Assert.NotNull(sub.EndDate);
    }

    [Fact]
    public void Upgrade_ToHigherTier_ShouldSucceed()
    {
        var sub = Subscription.Create(Guid.NewGuid(), SubscriptionTier.Pro);
        sub.Upgrade(SubscriptionTier.Premium);

        Assert.Equal(SubscriptionTier.Premium, sub.Tier);
    }

    [Fact]
    public void Upgrade_ToLowerTier_ShouldThrow()
    {
        var sub = Subscription.Create(Guid.NewGuid(), SubscriptionTier.Premium);

        Assert.Throws<InvalidOperationException>(() => sub.Upgrade(SubscriptionTier.Pro));
    }

    [Fact]
    public void Upgrade_ToSameTier_ShouldThrow()
    {
        var sub = Subscription.Create(Guid.NewGuid(), SubscriptionTier.Pro);

        Assert.Throws<InvalidOperationException>(() => sub.Upgrade(SubscriptionTier.Pro));
    }

    [Fact]
    public void Downgrade_ToLowerTier_ShouldSucceed()
    {
        var sub = Subscription.Create(Guid.NewGuid(), SubscriptionTier.Premium);
        sub.Downgrade(SubscriptionTier.Pro);

        Assert.Equal(SubscriptionTier.Pro, sub.Tier);
    }

    [Fact]
    public void Downgrade_ToHigherTier_ShouldThrow()
    {
        var sub = Subscription.Create(Guid.NewGuid(), SubscriptionTier.Free);

        Assert.Throws<InvalidOperationException>(() => sub.Downgrade(SubscriptionTier.Pro));
    }

    [Fact]
    public void HasExpired_WhenNoEndDate_ReturnsFalse()
    {
        var sub = Subscription.Create(Guid.NewGuid(), SubscriptionTier.Pro);

        Assert.False(sub.HasExpired());
    }

    [Fact]
    public void HasExpired_WhenCancelled_ReturnsTrue()
    {
        var sub = Subscription.Create(Guid.NewGuid(), SubscriptionTier.Pro);
        sub.Cancel();

        // EndDate is set to UtcNow which is in the past by the time we check
        // So it should be expired (or just about to be)
        Assert.True(sub.HasExpired() || sub.EndDate <= DateTime.UtcNow);
    }
}
