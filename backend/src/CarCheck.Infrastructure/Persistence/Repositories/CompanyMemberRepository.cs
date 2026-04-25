using CarCheck.Domain.Entities;
using CarCheck.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarCheck.Infrastructure.Persistence.Repositories;

public class CompanyMemberRepository : ICompanyMemberRepository
{
    private readonly CarCheckDbContext _context;

    public CompanyMemberRepository(CarCheckDbContext context)
    {
        _context = context;
    }

    public async Task<CompanyMember?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.CompanyMembers
            .FirstOrDefaultAsync(m => m.UserId == userId, cancellationToken);
    }

    public async Task<IReadOnlyList<CompanyMember>> GetByCompanyIdAsync(Guid companyId, CancellationToken cancellationToken = default)
    {
        return await _context.CompanyMembers
            .Where(m => m.CompanyId == companyId)
            .OrderBy(m => m.JoinedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsAsync(Guid companyId, Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.CompanyMembers
            .AnyAsync(m => m.CompanyId == companyId && m.UserId == userId, cancellationToken);
    }

    public async Task AddAsync(CompanyMember member, CancellationToken cancellationToken = default)
    {
        await _context.CompanyMembers.AddAsync(member, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(CompanyMember member, CancellationToken cancellationToken = default)
    {
        _context.CompanyMembers.Update(member);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(CompanyMember member, CancellationToken cancellationToken = default)
    {
        _context.CompanyMembers.Remove(member);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
