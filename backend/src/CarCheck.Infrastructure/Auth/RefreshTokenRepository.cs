using CarCheck.Application.Interfaces;
using CarCheck.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CarCheck.Infrastructure.Auth;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly CarCheckDbContext _context;

    public RefreshTokenRepository(CarCheckDbContext context)
    {
        _context = context;
    }

    public async Task<RefreshTokenEntry?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        return await _context.Set<RefreshTokenEntry>()
            .FirstOrDefaultAsync(r => r.Token == token, cancellationToken);
    }

    public async Task AddAsync(RefreshTokenEntry entry, CancellationToken cancellationToken = default)
    {
        await _context.Set<RefreshTokenEntry>().AddAsync(entry, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task RevokeAsync(string token, CancellationToken cancellationToken = default)
    {
        var entry = await _context.Set<RefreshTokenEntry>()
            .FirstOrDefaultAsync(r => r.Token == token, cancellationToken);

        if (entry is not null)
        {
            entry.Revoked = true;
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task RevokeAllForUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var tokens = await _context.Set<RefreshTokenEntry>()
            .Where(r => r.UserId == userId && !r.Revoked)
            .ToListAsync(cancellationToken);

        foreach (var token in tokens)
            token.Revoked = true;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
