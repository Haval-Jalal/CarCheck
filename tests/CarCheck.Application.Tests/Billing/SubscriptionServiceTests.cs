using CarCheck.Application.Billing;
using CarCheck.Application.Billing.DTOs;
using CarCheck.Application.Interfaces;
using CarCheck.Domain.Entities;
using CarCheck.Domain.Enums;
using CarCheck.Domain.Interfaces;
using NSubstitute;

namespace CarCheck.Application.Tests.Billing;

public class SubscriptionServiceTests
{
    private readonly ISubscriptionRepository _subscriptionRepository;
    private readonly IUserRepository _userRepository;
    private readonly IBillingProvider _billingProvider;
    private readonly ISecurityEventLogger _securityEventLogger;
    private readonly SubscriptionService _sut;

    public SubscriptionServiceTests()
    {
        _subscriptionRepository = Substitute.For<ISubscriptionRepository>();
        _userRepository = Substitute.For<IUserRepository>();
        _billingProvider = Substitute.For<IBillingProvider>();
        _securityEventLogger = Substitute.For<ISecurityEventLogger>();

        _sut = new SubscriptionService(
            _subscriptionRepository,
            _userRepository,
            _billingProvider,
            _securityEventLogger);
    }

    // ===== Get Current Subscription =====

    [Fact]
    public async Task GetCurrent_NoSubscription_ReturnsFreeTier()
    {
        var userId = Guid.NewGuid();
        _subscriptionRepository.GetActiveByUserIdAsync(userId).Returns((Subscription?)null);

        var result = await _sut.GetCurrentSubscriptionAsync(userId);

        Assert.True(result.IsSuccess);
        Assert.Equal(SubscriptionTier.Free, result.Value!.Tier);
        Assert.Equal("Free", result.Value.TierName);
        Assert.Equal(5, result.Value.Limits.DailySearches);
    }

    [Fact]
    public async Task GetCurrent_WithProSubscription_ReturnsProTier()
    {
        var userId = Guid.NewGuid();
        var sub = Subscription.Create(userId, SubscriptionTier.Pro);
        _subscriptionRepository.GetActiveByUserIdAsync(userId).Returns(sub);

        var result = await _sut.GetCurrentSubscriptionAsync(userId);

        Assert.True(result.IsSuccess);
        Assert.Equal(SubscriptionTier.Pro, result.Value!.Tier);
        Assert.Equal(50, result.Value.Limits.DailySearches);
        Assert.True(result.Value.Limits.AnalysisIncluded);
    }

    // ===== Create Checkout =====

    [Fact]
    public async Task CreateCheckout_ForFreeTier_ReturnsFailure()
    {
        var userId = Guid.NewGuid();

        var result = await _sut.CreateCheckoutAsync(userId, new SubscribeRequest(SubscriptionTier.Free));

        Assert.False(result.IsSuccess);
        Assert.Equal("Cannot purchase a free subscription.", result.Error);
    }

    [Fact]
    public async Task CreateCheckout_UserNotFound_ReturnsFailure()
    {
        var userId = Guid.NewGuid();
        _userRepository.GetByIdAsync(userId).Returns((User?)null);

        var result = await _sut.CreateCheckoutAsync(userId, new SubscribeRequest(SubscriptionTier.Pro));

        Assert.False(result.IsSuccess);
        Assert.Equal("User not found.", result.Error);
    }

    [Fact]
    public async Task CreateCheckout_AlreadyHasHigherTier_ReturnsFailure()
    {
        var userId = Guid.NewGuid();
        var user = User.Create("user@test.com", "hashed");
        var existingSub = Subscription.Create(userId, SubscriptionTier.Premium);

        _userRepository.GetByIdAsync(userId).Returns(user);
        _subscriptionRepository.GetActiveByUserIdAsync(userId).Returns(existingSub);

        var result = await _sut.CreateCheckoutAsync(userId, new SubscribeRequest(SubscriptionTier.Pro));

        Assert.False(result.IsSuccess);
        Assert.Contains("Premium", result.Error);
    }

    [Fact]
    public async Task CreateCheckout_ValidRequest_ReturnsCheckoutUrl()
    {
        var userId = Guid.NewGuid();
        var user = User.Create("user@test.com", "hashed");

        _userRepository.GetByIdAsync(userId).Returns(user);
        _subscriptionRepository.GetActiveByUserIdAsync(userId).Returns((Subscription?)null);
        _billingProvider.CreateCheckoutSessionAsync(userId, SubscriptionTier.Pro, Arg.Any<CancellationToken>())
            .Returns(new CreateCheckoutResult("sess_123", "https://checkout.example.com/sess_123"));

        var result = await _sut.CreateCheckoutAsync(userId, new SubscribeRequest(SubscriptionTier.Pro));

        Assert.True(result.IsSuccess);
        Assert.Equal("sess_123", result.Value!.SessionId);
        Assert.Contains("checkout", result.Value.CheckoutUrl);
        await _securityEventLogger.Received(1).LogAsync(userId, "CheckoutCreated", null, Arg.Any<CancellationToken>());
    }

    // ===== Activate Subscription =====

    [Fact]
    public async Task Activate_CancelsExistingAndCreatesNew()
    {
        var userId = Guid.NewGuid();
        var existingSub = Subscription.Create(userId, SubscriptionTier.Free);
        _subscriptionRepository.GetActiveByUserIdAsync(userId).Returns(existingSub);

        var result = await _sut.ActivateSubscriptionAsync(userId, SubscriptionTier.Pro, "ext_456");

        Assert.True(result.IsSuccess);
        Assert.Equal(SubscriptionTier.Pro, result.Value!.Tier);
        await _subscriptionRepository.Received(1).UpdateAsync(existingSub, Arg.Any<CancellationToken>());
        await _subscriptionRepository.Received(1).AddAsync(Arg.Any<Subscription>(), Arg.Any<CancellationToken>());
        await _securityEventLogger.Received(1).LogAsync(userId, "SubscriptionActivated", null, Arg.Any<CancellationToken>());
    }

    // ===== Cancel Subscription =====

    [Fact]
    public async Task Cancel_NoActiveSubscription_ReturnsFailure()
    {
        var userId = Guid.NewGuid();
        _subscriptionRepository.GetActiveByUserIdAsync(userId).Returns((Subscription?)null);

        var result = await _sut.CancelSubscriptionAsync(userId);

        Assert.False(result.IsSuccess);
        Assert.Equal("No active subscription found.", result.Error);
    }

    [Fact]
    public async Task Cancel_WithExternalId_CallsBillingProvider()
    {
        var userId = Guid.NewGuid();
        var sub = Subscription.Create(userId, SubscriptionTier.Pro, "ext_789");
        _subscriptionRepository.GetActiveByUserIdAsync(userId).Returns(sub);

        var result = await _sut.CancelSubscriptionAsync(userId);

        Assert.True(result.IsSuccess);
        await _billingProvider.Received(1).CancelSubscriptionAsync("ext_789", Arg.Any<CancellationToken>());
        await _subscriptionRepository.Received(1).UpdateAsync(sub, Arg.Any<CancellationToken>());
        await _securityEventLogger.Received(1).LogAsync(userId, "SubscriptionCancelled", null, Arg.Any<CancellationToken>());
    }

    // ===== Get Available Tiers =====

    [Fact]
    public void GetAvailableTiers_ReturnsAllThreeTiers()
    {
        var tiers = _sut.GetAvailableTiers();

        Assert.Equal(3, tiers.Count);
        Assert.Contains(tiers, t => t.Tier == SubscriptionTier.Free && t.PricePerMonthSek == 0);
        Assert.Contains(tiers, t => t.Tier == SubscriptionTier.Pro && t.PricePerMonthSek == 99);
        Assert.Contains(tiers, t => t.Tier == SubscriptionTier.Premium && t.PricePerMonthSek == 249);
    }
}
