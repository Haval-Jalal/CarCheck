using CarCheck.Domain.Entities;

namespace CarCheck.Domain.Interfaces;

public interface IFleetVehicleRepository
{
    Task<IReadOnlyList<FleetVehicle>> GetByCompanyIdAsync(Guid companyId, CancellationToken ct = default);
    Task<IReadOnlyList<FleetVehicle>> GetAllAsync(CancellationToken ct = default);
    Task<bool> ExistsAsync(Guid companyId, string registrationNumber, CancellationToken ct = default);
    Task AddAsync(FleetVehicle vehicle, CancellationToken ct = default);
    Task<FleetVehicle?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
