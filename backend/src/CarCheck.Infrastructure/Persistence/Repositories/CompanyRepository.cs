using CarCheck.Domain.Entities;
using CarCheck.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarCheck.Infrastructure.Persistence.Repositories;

public class CompanyRepository : ICompanyRepository
{
    private readonly CarCheckDbContext _context;

    public CompanyRepository(CarCheckDbContext context)
    {
        _context = context;
    }

    public async Task<Company?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Companies
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<Company?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Companies
            .Join(
                _context.CompanyMembers.Where(m => m.UserId == userId),
                c => c.Id,
                m => m.CompanyId,
                (c, _) => c)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task AddAsync(Company company, CancellationToken cancellationToken = default)
    {
        await _context.Companies.AddAsync(company, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Company company, CancellationToken cancellationToken = default)
    {
        _context.Companies.Update(company);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
