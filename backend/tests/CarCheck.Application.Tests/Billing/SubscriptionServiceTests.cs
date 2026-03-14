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
    private readonly ICreditTransactionRepository _transactionRepository;
    private readonly IEmailService _emailService;
    private readonly SubscriptionService _sut;

    public SubscriptionServiceTests()
    {
        _subscriptionRepository = Substitute.For<ISubscriptionRepository>();
        _userRepository = Substitute.For<IUserRepository>();
        _billingProvider = Substitute.For<IBillingProvider>();
        _securityEventLogger = Substitute.For<ISecurityEventLogger>();
        _transactionRepository = Substitute.For<ICreditTransactionRepository>();
        _emailService = Substitute.For<IEmailService>();

        _sut = new SubscriptionService(
            _subscriptionRepository,
            _userRepository,
            _billingProvider,
            _securityEventLogger,
            _transactionRepository,
            _emailService);
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
        Assert.Equal("Gratis", result.Value.TierName);
        Assert.Equal(3, result.Value.Limits.DailySearches);
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
        Assert.True(result.Value.Limits.DailySearches > 1000);
        Assert.True(result.Value.Limits.AnalysisIncluded);
    }

    // ===== Create Checkout =====

    [Fact]
    public async Task CreateCheckout_ForFreeTier_ReturnsFailure()
    {
        var userId = Guid.NewGuid();

        var result = await _sut.CreateCheckoutAsync(userId, new SubscribeRequest(SubscriptionTier.Free));

        Assert.False(result.IsSuccess);
        Assert.Equal("Det går inte att köpa ett gratisabonnemang.", result.Error);
    }

    [Fact]
    public async Task CreateCheckout_UserNotFound_ReturnsFailure()
    {
        var userId = Guid.NewGuid();
        _userRepository.GetByIdAsync(userId).Returns((User?)null);

        var result = await _sut.CreateCheckoutAsync(userId, new SubscribeRequest(SubscriptionTier.Pro));

        Assert.False(result.IsSuccess);
        Assert.Equal("Användare hittades inte.", result.Error);
    }

    [Fact]
    public async Task CreateCheckout_WithExistingSubscription_StillCreatesCheckout()
    {
        var userId = Guid.NewGuid();
        var user = User.Create("user@test.com", "hashed");
        var existingSub = Subscription.Create(userId, SubscriptionTier.Pro);

        _userRepository.GetByIdAsync(userId).Returns(user);
        _subscriptionRepository.GetActiveByUserIdAsync(userId).Returns(existingSub);
        _billingProvider.CreateCheckoutSessionAsync(userId, SubscriptionTier.Pro, Arg.Any<CancellationToken>())
            .Returns(new CreateCheckoutResult("sess_999", "https://checkout.example.com/sess_999"));

        var result = await _sut.CreateCheckoutAsync(userId, new SubscribeRequest(SubscriptionTier.Pro));

        Assert.True(result.IsSuccess);
        await _billingProvider.Received(1).CreateCheckoutSessionAsync(userId, SubscriptionTier.Pro, Arg.Any<CancellationToken>());
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
        await _securityEventLogger.Received(1).LogAsync(userId, "CheckoutCreated", null, Arg.Any<string?>(), Arg.Any<CancellationToken>());
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
        await _securityEventLogger.Received(1).LogAsync(userId, "SubscriptionActivated", null, Arg.Any<string?>(), Arg.Any<CancellationToken>());
    }

    // ===== Cancel Subscription =====

    [Fact]
    public async Task Cancel_NoActiveSubscription_ReturnsFailure()
    {
        var userId = Guid.NewGuid();
        _subscriptionRepository.GetActiveByUserIdAsync(userId).Returns((Subscription?)null);

        var result = await _sut.CancelSubscriptionAsync(userId);

        Assert.False(result.IsSuccess);
        Assert.Equal("Inget aktivt abonnemang hittades.", result.Error);
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
        await _securityEventLogger.Received(1).LogAsync(userId, "SubscriptionCancelled", null, Arg.Any<string?>(), Arg.Any<CancellationToken>());
    }

    // ===== Get Available Tiers =====

    [Fact]
    public void GetAvailableTiers_ReturnsTwoTiers()
    {
        var tiers = _sut.GetAvailableTiers();

        Assert.Equal(2, tiers.Count);
        Assert.Contains(tiers, t => t.Tier == SubscriptionTier.Free && t.PricePerMonthSek == 0);
        Assert.Contains(tiers, t => t.Tier == SubscriptionTier.Pro && t.PricePerMonthSek == 499);
    }
}
