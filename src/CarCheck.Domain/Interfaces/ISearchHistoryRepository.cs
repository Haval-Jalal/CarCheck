using CarCheck.Domain.Entities;

namespace CarCheck.Domain.Interfaces;

public interface ISearchHistoryRepository
{
    Task<IReadOnlyList<SearchHistory>> GetByUserIdAsync(Guid userId, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> GetCountByUserIdTodayAsync(Guid userId, CancellationToken cancellationToken = default);
    Task AddAsync(SearchHistory entry, CancellationToken cancellationToken = default);
    Task<SearchHistory?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task DeleteByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task DeleteAllByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
}
