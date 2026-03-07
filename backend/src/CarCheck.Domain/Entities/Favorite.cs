namespace CarCheck.Domain.Entities;

public class Favorite
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public Guid CarId { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private Favorite() { }

    public static Favorite Create(Guid userId, Guid carId)
    {
        if (userId == Guid.Empty)
            throw new ArgumentException("User ID is required.", nameof(userId));

        if (carId == Guid.Empty)
            throw new ArgumentException("Car ID is required.", nameof(carId));

        return new Favorite
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CarId = carId,
            CreatedAt = DateTime.UtcNow
        };
    }
}
