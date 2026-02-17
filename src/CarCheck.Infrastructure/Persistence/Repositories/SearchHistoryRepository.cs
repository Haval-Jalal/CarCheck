using CarCheck.Domain.Entities;
using CarCheck.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarCheck.Infrastructure.Persistence.Repositories;

public class SearchHistoryRepository : ISearchHistoryRepository
{
    private readonly CarCheckDbContext _context;

    public SearchHistoryRepository(CarCheckDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<SearchHistory>> GetByUserIdAsync(Guid userId, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        return await _context.SearchHistories
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.SearchedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetCountByUserIdTodayAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var todayUtc = DateTime.UtcNow.Date;

        return await _context.SearchHistories
            .CountAsync(s => s.UserId == userId && s.SearchedAt >= todayUtc, cancellationToken);
    }

    public async Task AddAsync(SearchHistory entry, CancellationToken cancellationToken = default)
    {
        await _context.SearchHistories.AddAsync(entry, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<SearchHistory?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.SearchHistories.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task DeleteByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entry = await _context.SearchHistories.FindAsync(new object[] { id }, cancellationToken);
        if (entry is not null)
        {
            _context.SearchHistories.Remove(entry);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task DeleteAllByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var entries = await _context.SearchHistories
            .Where(s => s.UserId == userId)
            .ToListAsync(cancellationToken);

        _context.SearchHistories.RemoveRange(entries);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
