using CarCheck.Application.Gdpr;
using CarCheck.Application.Interfaces;
using CarCheck.Domain.Entities;
using CarCheck.Domain.Enums;
using CarCheck.Domain.Interfaces;
using NSubstitute;

namespace CarCheck.Application.Tests.Gdpr;

public class GdprServiceTests
{
    private readonly IUserRepository _userRepository;
    private readonly ISearchHistoryRepository _searchHistoryRepository;
    private readonly IFavoriteRepository _favoriteRepository;
    private readonly ISubscriptionRepository _subscriptionRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly ISecurityEventLogger _securityEventLogger;
    private readonly GdprService _sut;

    public GdprServiceTests()
    {
        _userRepository = Substitute.For<IUserRepository>();
        _searchHistoryRepository = Substitute.For<ISearchHistoryRepository>();
        _favoriteRepository = Substitute.For<IFavoriteRepository>();
        _subscriptionRepository = Substitute.For<ISubscriptionRepository>();
        _refreshTokenRepository = Substitute.For<IRefreshTokenRepository>();
        _securityEventLogger = Substitute.For<ISecurityEventLogger>();
        _sut = new GdprService(
            _userRepository,
            _searchHistoryRepository,
            _favoriteRepository,
            _subscriptionRepository,
            _refreshTokenRepository,
            _securityEventLogger);
    }

    // ===== Export User Data =====

    [Fact]
    public async Task ExportUserData_ValidUser_ReturnsFullExport()
    {
        var user = User.Create("test@example.com", "hashedpass");
        var userId = user.Id;
        var carId = Guid.NewGuid();
        var history = SearchHistory.Create(userId, carId);
        var favorite = Favorite.Create(userId, carId);
        var subscription = Subscription.Create(userId, SubscriptionTier.Pro);

        _userRepository.GetByIdAsync(userId, Arg.Any<CancellationToken>()).Returns(user);
        _searchHistoryRepository.GetByUserIdAsync(userId, 1, 10000, Arg.Any<CancellationToken>())
            .Returns(new List<SearchHistory> { history });
        _favoriteRepository.GetByUserIdAsync(userId, 1, 10000, Arg.Any<CancellationToken>())
            .Returns(new List<Favorite> { favorite });
        _subscriptionRepository.GetByUserIdAsync(userId, Arg.Any<CancellationToken>())
            .Returns(new List<Subscription> { subscription });

        var result = await _sut.ExportUserDataAsync(userId);

        Assert.True(result.IsSuccess);
        var export = result.Value!;
        Assert.Equal(user.Email.Value, export.Profile.Email);
        Assert.Equal(userId, export.Profile.Id);
        Assert.Single(export.SearchHistory);
        Assert.Equal(carId, export.SearchHistory[0].CarId);
        Assert.Single(export.Favorites);
        Assert.Equal(carId, export.Favorites[0].CarId);
        Assert.Single(export.Subscriptions);
        Assert.Equal("Pro", export.Subscriptions[0].Tier);
        Assert.True(export.Subscriptions[0].IsActive);
    }

    [Fact]
    public async Task ExportUserData_UserNotFound_ReturnsFailure()
    {
        var userId = Guid.NewGuid();
        _userRepository.GetByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((User?)null);

        var result = await _sut.ExportUserDataAsync(userId);

        Assert.False(result.IsSuccess);
        Assert.Equal("User not found.", result.Error);
    }

    [Fact]
    public async Task ExportUserData_NoHistoryOrFavorites_ReturnsEmptyCollections()
    {
        var user = User.Create("empty@example.com", "hashedpass");
        var userId = user.Id;

        _userRepository.GetByIdAsync(userId, Arg.Any<CancellationToken>()).Returns(user);
        _searchHistoryRepository.GetByUserIdAsync(userId, 1, 10000, Arg.Any<CancellationToken>())
            .Returns(new List<SearchHistory>());
        _favoriteRepository.GetByUserIdAsync(userId, 1, 10000, Arg.Any<CancellationToken>())
            .Returns(new List<Favorite>());
        _subscriptionRepository.GetByUserIdAsync(userId, Arg.Any<CancellationToken>())
            .Returns(new List<Subscription>());

        var result = await _sut.ExportUserDataAsync(userId);

        Assert.True(result.IsSuccess);
        Assert.Empty(result.Value!.SearchHistory);
        Assert.Empty(result.Value.Favorites);
        Assert.Empty(result.Value.Subscriptions);
    }

    [Fact]
    public async Task ExportUserData_LogsSecurityEvent()
    {
        var user = User.Create("log@example.com", "hashedpass");
        var userId = user.Id;

        _userRepository.GetByIdAsync(userId, Arg.Any<CancellationToken>()).Returns(user);
        _searchHistoryRepository.GetByUserIdAsync(userId, 1, 10000, Arg.Any<CancellationToken>())
            .Returns(new List<SearchHistory>());
        _favoriteRepository.GetByUserIdAsync(userId, 1, 10000, Arg.Any<CancellationToken>())
            .Returns(new List<Favorite>());
        _subscriptionRepository.GetByUserIdAsync(userId, Arg.Any<CancellationToken>())
            .Returns(new List<Subscription>());

        await _sut.ExportUserDataAsync(userId);

        await _securityEventLogger.Received(1).LogAsync(userId, "DataExported", null, Arg.Any<CancellationToken>());
    }

    // ===== Request Data Deletion =====

    [Fact]
    public async Task RequestDataDeletion_ValidUser_DeletesAndReturnsSuccess()
    {
        var user = User.Create("delete@example.com", "hashedpass");
        var userId = user.Id;

        _userRepository.GetByIdAsync(userId, Arg.Any<CancellationToken>()).Returns(user);

        var result = await _sut.RequestDataDeletionAsync(userId);

        Assert.True(result.IsSuccess);
        Assert.True(result.Value!.Success);
        Assert.Contains("permanently deleted", result.Value.Message);
        await _refreshTokenRepository.Received(1).RevokeAllForUserAsync(userId, Arg.Any<CancellationToken>());
        await _userRepository.Received(1).DeleteAsync(userId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task RequestDataDeletion_UserNotFound_ReturnsFailure()
    {
        var userId = Guid.NewGuid();
        _userRepository.GetByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((User?)null);

        var result = await _sut.RequestDataDeletionAsync(userId);

        Assert.False(result.IsSuccess);
        Assert.Equal("User not found.", result.Error);
    }

    [Fact]
    public async Task RequestDataDeletion_RevokesSessionsBeforeDeletion()
    {
        var user = User.Create("revoke@example.com", "hashedpass");
        var userId = user.Id;

        _userRepository.GetByIdAsync(userId, Arg.Any<CancellationToken>()).Returns(user);

        await _sut.RequestDataDeletionAsync(userId);

        Received.InOrder(() =>
        {
            _refreshTokenRepository.RevokeAllForUserAsync(userId, Arg.Any<CancellationToken>());
            _securityEventLogger.LogAsync(userId, "DataDeletionRequested", null, Arg.Any<CancellationToken>());
            _userRepository.DeleteAsync(userId, Arg.Any<CancellationToken>());
        });
    }

    [Fact]
    public async Task RequestDataDeletion_LogsSecurityEvent()
    {
        var user = User.Create("log-del@example.com", "hashedpass");
        var userId = user.Id;

        _userRepository.GetByIdAsync(userId, Arg.Any<CancellationToken>()).Returns(user);

        await _sut.RequestDataDeletionAsync(userId);

        await _securityEventLogger.Received(1).LogAsync(userId, "DataDeletionRequested", null, Arg.Any<CancellationToken>());
    }
}
