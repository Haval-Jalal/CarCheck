namespace CarCheck.Domain.Entities;

public class SearchHistory
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public Guid CarId { get; private set; }
    public DateTime SearchedAt { get; private set; }

    private SearchHistory() { }

    public static SearchHistory Create(Guid userId, Guid carId)
    {
        if (userId == Guid.Empty)
            throw new ArgumentException("User ID is required.", nameof(userId));

        if (carId == Guid.Empty)
            throw new ArgumentException("Car ID is required.", nameof(carId));

        return new SearchHistory
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CarId = carId,
            SearchedAt = DateTime.UtcNow
        };
    }
}
