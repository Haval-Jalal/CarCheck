using CarCheck.Domain.Entities;
using CarCheck.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarCheck.Infrastructure.Persistence.Repositories;

public class FavoriteRepository : IFavoriteRepository
{
    private readonly CarCheckDbContext _context;

    public FavoriteRepository(CarCheckDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Favorite>> GetByUserIdAsync(Guid userId, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        return await _context.Favorites
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsAsync(Guid userId, Guid carId, CancellationToken cancellationToken = default)
    {
        return await _context.Favorites
            .AnyAsync(f => f.UserId == userId && f.CarId == carId, cancellationToken);
    }

    public async Task AddAsync(Favorite favorite, CancellationToken cancellationToken = default)
    {
        await _context.Favorites.AddAsync(favorite, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoveAsync(Guid userId, Guid carId, CancellationToken cancellationToken = default)
    {
        var favorite = await _context.Favorites
            .FirstOrDefaultAsync(f => f.UserId == userId && f.CarId == carId, cancellationToken);

        if (favorite is not null)
        {
            _context.Favorites.Remove(favorite);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
