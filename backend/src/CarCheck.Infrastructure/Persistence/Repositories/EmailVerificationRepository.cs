using CarCheck.Domain.Entities;
using CarCheck.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarCheck.Infrastructure.Persistence.Repositories;

public class EmailVerificationRepository : IEmailVerificationRepository
{
    private readonly CarCheckDbContext _context;

    public EmailVerificationRepository(CarCheckDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(EmailVerification verification, CancellationToken cancellationToken = default)
    {
        await _context.EmailVerifications.AddAsync(verification, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<EmailVerification?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        return await _context.EmailVerifications
            .FirstOrDefaultAsync(e => e.Token == token, cancellationToken);
    }

    public async Task UpdateAsync(EmailVerification verification, CancellationToken cancellationToken = default)
    {
        _context.EmailVerifications.Update(verification);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
