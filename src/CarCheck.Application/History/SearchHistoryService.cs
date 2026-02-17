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

    public async Task<Result<bool>> DeleteEntryAsync(
        Guid userId, Guid entryId, CancellationToken cancellationToken = default)
    {
        var entry = await _searchHistoryRepository.GetByIdAsync(entryId, cancellationToken);
        if (entry is null)
            return Result<bool>.Failure("Entry not found.");

        if (entry.UserId != userId)
            return Result<bool>.Failure("Entry not found.");

        await _searchHistoryRepository.DeleteByIdAsync(entryId, cancellationToken);
        return Result<bool>.Success(true);
    }

    public async Task<Result<bool>> ClearHistoryAsync(
        Guid userId, CancellationToken cancellationToken = default)
    {
        await _searchHistoryRepository.DeleteAllByUserIdAsync(userId, cancellationToken);
        return Result<bool>.Success(true);
    }
}
