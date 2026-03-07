namespace CarCheck.Domain.Entities;

public class AnalysisResult
{
    public Guid Id { get; private set; }
    public Guid CarId { get; private set; }
    public decimal Score { get; private set; }
    public string Recommendation { get; private set; } = string.Empty;
    public DateTime CreatedAt { get; private set; }

    private AnalysisResult() { }

    public static AnalysisResult Create(Guid carId, decimal score, string recommendation)
    {
        if (carId == Guid.Empty)
            throw new ArgumentException("Car ID is required.", nameof(carId));

        if (score < 0 || score > 100)
            throw new ArgumentOutOfRangeException(nameof(score), "Score must be between 0 and 100.");

        if (string.IsNullOrWhiteSpace(recommendation))
            throw new ArgumentException("Recommendation is required.", nameof(recommendation));

        return new AnalysisResult
        {
            Id = Guid.NewGuid(),
            CarId = carId,
            Score = score,
            Recommendation = recommendation,
            CreatedAt = DateTime.UtcNow
        };
    }
}
