using CarCheck.Domain.Entities;
using CarCheck.Domain.ValueObjects;

namespace CarCheck.Domain.Interfaces;

public interface ICarRepository
{
    Task<Car?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Car?> GetByRegistrationNumberAsync(RegistrationNumber registrationNumber, CancellationToken cancellationToken = default);
    Task AddAsync(Car car, CancellationToken cancellationToken = default);
    Task UpdateAsync(Car car, CancellationToken cancellationToken = default);
}
