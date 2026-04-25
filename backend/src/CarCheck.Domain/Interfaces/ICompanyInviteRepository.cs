using CarCheck.Domain.Entities;

namespace CarCheck.Domain.Interfaces;

public interface ICompanyInviteRepository
{
    Task<CompanyInvite?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CompanyInvite>> GetPendingByCompanyIdAsync(Guid companyId, CancellationToken cancellationToken = default);
    Task AddAsync(CompanyInvite invite, CancellationToken cancellationToken = default);
    Task UpdateAsync(CompanyInvite invite, CancellationToken cancellationToken = default);
}
