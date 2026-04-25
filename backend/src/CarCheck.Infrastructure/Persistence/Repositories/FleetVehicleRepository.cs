using CarCheck.Domain.Entities;
using CarCheck.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CarCheck.Infrastructure.Persistence.Repositories;

public class FleetVehicleRepository : IFleetVehicleRepository
{
    private readonly CarCheckDbContext _context;

    public FleetVehicleRepository(CarCheckDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<FleetVehicle>> GetByCompanyIdAsync(Guid companyId, CancellationToken ct = default)
        => await _context.FleetVehicles
            .Where(f => f.CompanyId == companyId)
            .OrderBy(f => f.AddedAt)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<FleetVehicle>> GetAllAsync(CancellationToken ct = default)
        => await _context.FleetVehicles
            .OrderBy(f => f.CompanyId)
            .ThenBy(f => f.AddedAt)
            .ToListAsync(ct);

    public async Task<bool> ExistsAsync(Guid companyId, string registrationNumber, CancellationToken ct = default)
        => await _context.FleetVehicles
            .AnyAsync(f => f.CompanyId == companyId
                        && f.RegistrationNumber == registrationNumber.ToUpperInvariant().Trim(), ct);

    public async Task AddAsync(FleetVehicle vehicle, CancellationToken ct = default)
    {
        await _context.FleetVehicles.AddAsync(vehicle, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task<FleetVehicle?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.FleetVehicles.FindAsync(new object[] { id }, ct);

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var vehicle = await _context.FleetVehicles.FindAsync(new object[] { id }, ct);
        if (vehicle is not null)
        {
            _context.FleetVehicles.Remove(vehicle);
            await _context.SaveChangesAsync(ct);
        }
    }
}
