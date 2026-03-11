using CarCheck.Domain.Entities;

namespace CarCheck.Domain.Interfaces;

public interface IEmailVerificationRepository
{
    Task AddAsync(EmailVerification verification, CancellationToken cancellationToken = default);
    Task<EmailVerification?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);
    Task UpdateAsync(EmailVerification verification, CancellationToken cancellationToken = default);
}
