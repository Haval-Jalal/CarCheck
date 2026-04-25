namespace CarCheck.Domain.Entities;

public class FleetVehicle
{
    public Guid Id { get; private set; }
    public Guid CompanyId { get; private set; }
    public string RegistrationNumber { get; private set; } = string.Empty;
    public string? Nickname { get; private set; }
    public Guid AddedByUserId { get; private set; }
    public DateTime AddedAt { get; private set; }

    private FleetVehicle() { }

    public static FleetVehicle Create(
        Guid companyId,
        string registrationNumber,
        string? nickname,
        Guid addedByUserId)
    {
        if (companyId == Guid.Empty) throw new ArgumentException("Company ID is required.", nameof(companyId));
        if (string.IsNullOrWhiteSpace(registrationNumber)) throw new ArgumentException("Registration number is required.", nameof(registrationNumber));

        return new FleetVehicle
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            RegistrationNumber = registrationNumber.ToUpperInvariant().Trim(),
            Nickname = nickname?.Trim(),
            AddedByUserId = addedByUserId,
            AddedAt = DateTime.UtcNow,
        };
    }
}
