using CarCheck.Domain.Interfaces;
using CarCheck.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CarCheck.Infrastructure.Persistence.Repositories;

public class DeletionFeedbackRepository : IDeletionFeedbackRepository
{
    private readonly CarCheckDbContext _context;

    public DeletionFeedbackRepository(CarCheckDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(string reason, CancellationToken cancellationToken = default)
    {
        await _context.Database.ExecuteSqlRawAsync(
            "INSERT INTO deletion_feedback (reason) VALUES ({0})",
            new object[] { reason },
            cancellationToken);
    }
}
