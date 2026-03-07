namespace CarCheck.Domain.Entities;

public class SecurityEvent
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string Type { get; private set; } = string.Empty;
    public string? Metadata { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private SecurityEvent() { }

    public static SecurityEvent Create(Guid userId, string type, string? metadata = null)
    {
        if (userId == Guid.Empty)
            throw new ArgumentException("User ID is required.", nameof(userId));

        if (string.IsNullOrWhiteSpace(type))
            throw new ArgumentException("Event type is required.", nameof(type));

        return new SecurityEvent
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = type,
            Metadata = metadata,
            CreatedAt = DateTime.UtcNow
        };
    }
}
