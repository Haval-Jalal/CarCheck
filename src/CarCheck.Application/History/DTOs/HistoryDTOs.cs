namespace CarCheck.Application.History.DTOs;

public record SearchHistoryResponse(
    Guid Id,
    Guid CarId,
    string? RegistrationNumber,
    string? Brand,
    string? Model,
    int? Year,
    DateTime SearchedAt);

public record SearchHistoryPageResponse(
    IReadOnlyList<SearchHistoryResponse> Items,
    int Page,
    int PageSize,
    int TodayCount);
