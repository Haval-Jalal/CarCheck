namespace CarCheck.Application.Interfaces;

public interface ISecurityEventLogger
{
    Task LogAsync(Guid userId, string eventType, string? metadata = null, CancellationToken cancellationToken = default);
}
