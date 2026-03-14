using CarCheck.Application.Interfaces;
using CarCheck.Domain.Entities;
using CarCheck.Infrastructure.Persistence;

namespace CarCheck.Infrastructure.Auth;

public class SecurityEventLogger : ISecurityEventLogger
{
    private readonly CarCheckDbContext _context;

    public SecurityEventLogger(CarCheckDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(Guid userId, string eventType, string? metadata = null, string? ipAddress = null, CancellationToken cancellationToken = default)
    {
        var securityEvent = SecurityEvent.Create(userId, eventType, metadata, ipAddress);
        await _context.SecurityEvents.AddAsync(securityEvent, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
