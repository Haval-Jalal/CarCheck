namespace CarCheck.Application.Gdpr.DTOs;

public record UserDataExport(
    UserProfileData Profile,
    IReadOnlyList<CreditTransactionExport> CreditTransactions,
    IReadOnlyList<SubscriptionExport> Subscriptions,
    IReadOnlyList<SearchHistoryExport> SearchHistory,
    IReadOnlyList<FavoriteExport> Favorites,
    DateTime ExportedAt);

public record UserProfileData(
    Guid Id,
    string Email,
    bool EmailVerified,
    bool TwoFactorEnabled,
    DateTime CreatedAt);

public record CreditTransactionExport(
    DateTime Date,
    string Description,
    int? Credits,
    decimal AmountSek,
    string Type);

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
