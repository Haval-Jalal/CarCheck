namespace CarCheck.Application.Gdpr.DTOs;

public record UserDataExport(
    UserProfileData Profile,
    IReadOnlyList<SearchHistoryExport> SearchHistory,
    IReadOnlyList<FavoriteExport> Favorites,
    IReadOnlyList<SubscriptionExport> Subscriptions,
    DateTime ExportedAt);

public record UserProfileData(
    Guid Id,
    string Email,
    bool EmailVerified,
    bool TwoFactorEnabled,
    DateTime CreatedAt);

public record SearchHistoryExport(
    Guid CarId,
    DateTime SearchedAt);

public record FavoriteExport(
    Guid CarId,
    DateTime CreatedAt);

public record SubscriptionExport(
    string Tier,
    bool IsActive,
    DateTime StartDate,
    DateTime? EndDate);

public record DataDeletionResponse(
    bool Success,
    string Message,
    DateTime RequestedAt);
