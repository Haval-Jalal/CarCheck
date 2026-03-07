using CarCheck.Domain.Entities;
using CarCheck.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarCheck.Infrastructure.Persistence.Repositories;

public class SubscriptionRepository : ISubscriptionRepository
{
    private readonly CarCheckDbContext _context;

    public SubscriptionRepository(CarCheckDbContext context)
    {
        _context = context;
    }

    public async Task<Subscription?> GetActiveByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Subscriptions
            .Where(s => s.UserId == userId && s.IsActive)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Subscription>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Subscriptions
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Subscription subscription, CancellationToken cancellationToken = default)
    {
        await _context.Subscriptions.AddAsync(subscription, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Subscription subscription, CancellationToken cancellationToken = default)
    {
        _context.Subscriptions.Update(subscription);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
