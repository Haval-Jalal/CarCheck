namespace CarCheck.Application.Favorites.DTOs;

public record AddFavoriteRequest(Guid CarId);

public record FavoriteResponse(
    Guid Id,
    Guid CarId,
    string? RegistrationNumber,
    string? Brand,
    string? Model,
    int? Year,
    DateTime CreatedAt);

public record FavoritePageResponse(
    IReadOnlyList<FavoriteResponse> Items,
    int Page,
    int PageSize);
