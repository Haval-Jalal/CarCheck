using CarCheck.Domain.Entities;

namespace CarCheck.Domain.Interfaces;

public interface ICompanyMemberRepository
{
    Task<CompanyMember?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CompanyMember>> GetByCompanyIdAsync(Guid companyId, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Guid companyId, Guid userId, CancellationToken cancellationToken = default);
    Task AddAsync(CompanyMember member, CancellationToken cancellationToken = default);
    Task UpdateAsync(CompanyMember member, CancellationToken cancellationToken = default);
    Task DeleteAsync(CompanyMember member, CancellationToken cancellationToken = default);
}
