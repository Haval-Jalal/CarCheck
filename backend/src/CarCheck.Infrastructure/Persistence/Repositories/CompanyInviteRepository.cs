using CarCheck.Domain.Entities;
using CarCheck.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarCheck.Infrastructure.Persistence.Repositories;

public class CompanyInviteRepository : ICompanyInviteRepository
{
    private readonly CarCheckDbContext _context;

    public CompanyInviteRepository(CarCheckDbContext context)
    {
        _context = context;
    }

    public async Task<CompanyInvite?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        return await _context.CompanyInvites
            .FirstOrDefaultAsync(i => i.Token == token, cancellationToken);
    }

    public async Task<IReadOnlyList<CompanyInvite>> GetPendingByCompanyIdAsync(Guid companyId, CancellationToken cancellationToken = default)
    {
        return await _context.CompanyInvites
            .Where(i => i.CompanyId == companyId && i.UsedAt == null && i.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(CompanyInvite invite, CancellationToken cancellationToken = default)
    {
        await _context.CompanyInvites.AddAsync(invite, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(CompanyInvite invite, CancellationToken cancellationToken = default)
    {
        _context.CompanyInvites.Update(invite);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
