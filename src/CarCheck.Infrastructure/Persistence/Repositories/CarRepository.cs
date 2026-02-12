using CarCheck.Domain.Entities;
using CarCheck.Domain.Interfaces;
using CarCheck.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace CarCheck.Infrastructure.Persistence.Repositories;

public class CarRepository : ICarRepository
{
    private readonly CarCheckDbContext _context;

    public CarRepository(CarCheckDbContext context)
    {
        _context = context;
    }

    public async Task<Car?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Cars.FindAsync([id], cancellationToken);
    }

    public async Task<Car?> GetByRegistrationNumberAsync(RegistrationNumber registrationNumber, CancellationToken cancellationToken = default)
    {
        return await _context.Cars
            .FirstOrDefaultAsync(c => c.RegistrationNumber == registrationNumber, cancellationToken);
    }

    public async Task AddAsync(Car car, CancellationToken cancellationToken = default)
    {
        await _context.Cars.AddAsync(car, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Car car, CancellationToken cancellationToken = default)
    {
        _context.Cars.Update(car);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
