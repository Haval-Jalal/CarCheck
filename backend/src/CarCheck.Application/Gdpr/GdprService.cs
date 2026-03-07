using CarCheck.Application.Auth;
using CarCheck.Application.Gdpr.DTOs;
using CarCheck.Application.Interfaces;
using CarCheck.Domain.Interfaces;

namespace CarCheck.Application.Gdpr;

public class GdprService
{
    private readonly IUserRepository _userRepository;
    private readonly ISearchHistoryRepository _searchHistoryRepository;
    private readonly IFavoriteRepository _favoriteRepository;
    private readonly ISubscriptionRepository _subscriptionRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly ISecurityEventLogger _securityEventLogger;

    public GdprService(
        IUserRepository userRepository,
        ISearchHistoryRepository searchHistoryRepository,
        IFavoriteRepository favoriteRepository,
        ISubscriptionRepository subscriptionRepository,
        IRefreshTokenRepository refreshTokenRepository,
        ISecurityEventLogger securityEventLogger)
    {
        _userRepository = userRepository;
        _searchHistoryRepository = searchHistoryRepository;
        _favoriteRepository = favoriteRepository;
        _subscriptionRepository = subscriptionRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _securityEventLogger = securityEventLogger;
    }

    public async Task<Result<UserDataExport>> ExportUserDataAsync(
        Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
            return Result<UserDataExport>.Failure("User not found.");

        var searchHistory = await _searchHistoryRepository.GetByUserIdAsync(userId, 1, 10000, cancellationToken);
        var favorites = await _favoriteRepository.GetByUserIdAsync(userId, 1, 10000, cancellationToken);
        var subscriptions = await _subscriptionRepository.GetByUserIdAsync(userId, cancellationToken);

        var export = new UserDataExport(
            new UserProfileData(user.Id, user.Email.Value, user.EmailVerified, user.TwoFactorEnabled, user.CreatedAt),
            searchHistory.Select(s => new SearchHistoryExport(s.CarId, s.SearchedAt)).ToList(),
            favorites.Select(f => new FavoriteExport(f.CarId, f.CreatedAt)).ToList(),
            subscriptions.Select(s => new SubscriptionExport(s.Tier.ToString(), s.IsActive, s.StartDate, s.EndDate)).ToList(),
            DateTime.UtcNow);

        await _securityEventLogger.LogAsync(userId, "DataExported", null, cancellationToken);

        return Result<UserDataExport>.Success(export);
    }

    public async Task<Result<DataDeletionResponse>> RequestDataDeletionAsync(
        Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
            return Result<DataDeletionResponse>.Failure("User not found.");

        // Revoke all sessions
        await _refreshTokenRepository.RevokeAllForUserAsync(userId, cancellationToken);

        // Log the deletion request
        await _securityEventLogger.LogAsync(userId, "DataDeletionRequested", null, cancellationToken);

        // Delete user data (cascading deletes handle related records via DB constraints)
        await _userRepository.DeleteAsync(userId, cancellationToken);

        return Result<DataDeletionResponse>.Success(new DataDeletionResponse(
            true,
            "Your account and all associated data have been permanently deleted.",
            DateTime.UtcNow));
    }
}
