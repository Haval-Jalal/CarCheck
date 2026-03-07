using CarCheck.Domain.Entities;

namespace CarCheck.Domain.Interfaces;

public interface IFavoriteRepository
{
    Task<IReadOnlyList<Favorite>> GetByUserIdAsync(Guid userId, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Guid userId, Guid carId, CancellationToken cancellationToken = default);
    Task AddAsync(Favorite favorite, CancellationToken cancellationToken = default);
    Task RemoveAsync(Guid userId, Guid carId, CancellationToken cancellationToken = default);
}
