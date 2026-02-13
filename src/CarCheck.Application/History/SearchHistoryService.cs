using CarCheck.Application.Auth;
using CarCheck.Application.History.DTOs;
using CarCheck.Domain.Interfaces;

namespace CarCheck.Application.History;

public class SearchHistoryService
{
    private readonly ISearchHistoryRepository _searchHistoryRepository;
    private readonly ICarRepository _carRepository;

    public SearchHistoryService(
        ISearchHistoryRepository searchHistoryRepository,
        ICarRepository carRepository)
    {
        _searchHistoryRepository = searchHistoryRepository;
        _carRepository = carRepository;
    }

    public async Task<Result<SearchHistoryPageResponse>> GetHistoryAsync(
        Guid userId, int page = 1, int pageSize = 20, CancellationToken cancellationToken = default)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 1;
        if (pageSize > 100) pageSize = 100;

        var entries = await _searchHistoryRepository.GetByUserIdAsync(userId, page, pageSize, cancellationToken);
        var todayCount = await _searchHistoryRepository.GetCountByUserIdTodayAsync(userId, cancellationToken);

        var items = new List<SearchHistoryResponse>();
        foreach (var entry in entries)
        {
            var car = await _carRepository.GetByIdAsync(entry.CarId, cancellationToken);
            items.Add(new SearchHistoryResponse(
                entry.Id,
                entry.CarId,
                car?.RegistrationNumber.Value,
                car?.Brand,
                car?.Model,
                car?.Year,
                entry.SearchedAt));
        }

        return Result<SearchHistoryPageResponse>.Success(
            new SearchHistoryPageResponse(items, page, pageSize, todayCount));
    }
}
