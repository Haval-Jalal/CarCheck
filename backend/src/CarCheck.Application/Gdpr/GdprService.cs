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
    private readonly IPasswordHasher _passwordHasher;
    private readonly IDeletionFeedbackRepository _deletionFeedbackRepository;

    public GdprService(
        IUserRepository userRepository,
        ISearchHistoryRepository searchHistoryRepository,
        IFavoriteRepository favoriteRepository,
        ISubscriptionRepository subscriptionRepository,
        IRefreshTokenRepository refreshTokenRepository,
        ISecurityEventLogger securityEventLogger,
        IPasswordHasher passwordHasher,
        IDeletionFeedbackRepository deletionFeedbackRepository)
    {
        _userRepository = userRepository;
        _searchHistoryRepository = searchHistoryRepository;
        _favoriteRepository = favoriteRepository;
        _subscriptionRepository = subscriptionRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _securityEventLogger = securityEventLogger;
        _passwordHasher = passwordHasher;
        _deletionFeedbackRepository = deletionFeedbackRepository;
    }

    public async Task<Result<UserDataExport>> ExportUserDataAsync(
        Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
            return Result<UserDataExport>.Failure("Användare hittades inte.");

        var searchHistory = await _searchHistoryRepository.GetByUserIdAsync(userId, 1, 10000, cancellationToken);
        var favorites = await _favoriteRepository.GetByUserIdAsync(userId, 1, 10000, cancellationToken);
        var subscriptions = await _subscriptionRepository.GetByUserIdAsync(userId, cancellationToken);

        var export = new UserDataExport(
            new UserProfileData(user.Id, user.Email.Value, user.EmailVerified, user.TwoFactorEnabled, user.CreatedAt),
            searchHistory.Select(s => new SearchHistoryExport(s.CarId, s.SearchedAt)).ToList(),
            favorites.Select(f => new FavoriteExport(f.CarId, f.CreatedAt)).ToList(),
            subscriptions.Select(s => new SubscriptionExport(s.Tier.ToString(), s.IsActive, s.StartDate, s.EndDate)).ToList(),
            DateTime.UtcNow);

        await _securityEventLogger.LogAsync(userId, "DataExported", cancellationToken: cancellationToken);

        return Result<UserDataExport>.Success(export);
    }

    public async Task<Result<DataDeletionResponse>> RequestDataDeletionAsync(
        Guid userId, string password, string? reason, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
            return Result<DataDeletionResponse>.Failure("Användare hittades inte.");

        if (!user.EmailVerified)
            return Result<DataDeletionResponse>.Failure("E-postadressen måste verifieras innan kontot kan raderas.");

        if (!_passwordHasher.Verify(password, user.PasswordHash))
            return Result<DataDeletionResponse>.Failure("Felaktigt lösenord.");

        // Revoke all sessions
        await _refreshTokenRepository.RevokeAllForUserAsync(userId, cancellationToken);

        // Save feedback before deleting (no FK to users, survives cascade delete)
        if (!string.IsNullOrWhiteSpace(reason))
            await _deletionFeedbackRepository.AddAsync(reason, cancellationToken);

        // Log the deletion request
        await _securityEventLogger.LogAsync(userId, "DataDeletionRequested", cancellationToken: cancellationToken);

        // Delete user data (cascading deletes handle related records via DB constraints)
        await _userRepository.DeleteAsync(userId, cancellationToken);

        return Result<DataDeletionResponse>.Success(new DataDeletionResponse(
            true,
            "Ditt konto och all tillhörande data har raderats permanent.",
            DateTime.UtcNow));
    }
}
