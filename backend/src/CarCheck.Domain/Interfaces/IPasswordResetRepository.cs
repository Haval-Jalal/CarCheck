using CarCheck.Domain.Entities;

namespace CarCheck.Domain.Interfaces;

public interface IPasswordResetRepository
{
    Task AddAsync(PasswordReset reset, CancellationToken cancellationToken = default);
    Task<PasswordReset?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);
    Task UpdateAsync(PasswordReset reset, CancellationToken cancellationToken = default);
}
