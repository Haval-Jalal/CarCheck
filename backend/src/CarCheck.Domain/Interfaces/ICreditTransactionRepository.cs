using CarCheck.Domain.Entities;

namespace CarCheck.Domain.Interfaces;

public interface ICreditTransactionRepository
{
    Task AddAsync(CreditTransaction transaction, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CreditTransaction>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<bool> ExistsByExternalPaymentIdAsync(string externalPaymentId, CancellationToken cancellationToken = default);
}
