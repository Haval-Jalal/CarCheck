using CarCheck.Domain.Entities;
using CarCheck.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarCheck.Infrastructure.Persistence.Repositories;

public class PasswordResetRepository : IPasswordResetRepository
{
    private readonly CarCheckDbContext _context;

    public PasswordResetRepository(CarCheckDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(PasswordReset reset, CancellationToken cancellationToken = default)
    {
        await _context.PasswordResets.AddAsync(reset, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<PasswordReset?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        return await _context.PasswordResets
            .FirstOrDefaultAsync(p => p.Token == token, cancellationToken);
    }

    public async Task UpdateAsync(PasswordReset reset, CancellationToken cancellationToken = default)
    {
        _context.PasswordResets.Update(reset);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
