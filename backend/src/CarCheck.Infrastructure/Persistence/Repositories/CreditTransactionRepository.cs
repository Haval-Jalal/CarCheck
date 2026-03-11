using CarCheck.Domain.Entities;
using CarCheck.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarCheck.Infrastructure.Persistence.Repositories;

public class CreditTransactionRepository : ICreditTransactionRepository
{
    private readonly CarCheckDbContext _context;

    public CreditTransactionRepository(CarCheckDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(CreditTransaction transaction, CancellationToken cancellationToken = default)
    {
        await _context.CreditTransactions.AddAsync(transaction, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CreditTransaction>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.CreditTransactions
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsByExternalPaymentIdAsync(string externalPaymentId, CancellationToken cancellationToken = default)
    {
        return await _context.CreditTransactions
            .AnyAsync(t => t.ExternalPaymentId == externalPaymentId, cancellationToken);
    }
}
