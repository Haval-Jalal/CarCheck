using CarCheck.Domain.Entities;
using CarCheck.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarCheck.Infrastructure.Persistence.Repositories;

public class AnalysisResultRepository : IAnalysisResultRepository
{
    private readonly CarCheckDbContext _context;

    public AnalysisResultRepository(CarCheckDbContext context)
    {
        _context = context;
    }

    public async Task<AnalysisResult?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.AnalysisResults.FindAsync([id], cancellationToken);
    }

    public async Task<AnalysisResult?> GetLatestByCarIdAsync(Guid carId, CancellationToken cancellationToken = default)
    {
        return await _context.AnalysisResults
            .Where(a => a.CarId == carId)
            .OrderByDescending(a => a.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AnalysisResult>> GetByCarIdAsync(Guid carId, CancellationToken cancellationToken = default)
    {
        return await _context.AnalysisResults
            .Where(a => a.CarId == carId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(AnalysisResult result, CancellationToken cancellationToken = default)
    {
        await _context.AnalysisResults.AddAsync(result, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
