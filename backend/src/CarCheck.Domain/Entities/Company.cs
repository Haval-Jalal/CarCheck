namespace CarCheck.Domain.Entities;

public class Company
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? OrgNumber { get; private set; }
    public string? LogoUrl { get; private set; }
    public Guid CreatedByUserId { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private Company() { }

    public static Company Create(string name, Guid createdByUserId, string? orgNumber = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Company name is required.", nameof(name));
        if (createdByUserId == Guid.Empty)
            throw new ArgumentException("CreatedByUserId is required.", nameof(createdByUserId));

        return new Company
        {
            Id = Guid.NewGuid(),
            Name = name.Trim(),
            OrgNumber = orgNumber?.Trim(),
            CreatedByUserId = createdByUserId,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void UpdateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Company name is required.", nameof(name));
        Name = name.Trim();
    }

    public void UpdateLogoUrl(string? logoUrl) => LogoUrl = logoUrl;
}
