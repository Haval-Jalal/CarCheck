namespace CarCheck.Domain.Entities;

public class CreditTransaction
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string Type { get; private set; } = string.Empty; // "credits" | "subscription" | "trial"
    public int? Credits { get; private set; }
    public int AmountOre { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public string? ExternalPaymentId { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private CreditTransaction() { }

    public static CreditTransaction CreateCredits(Guid userId, int credits, int amountOre, string? externalPaymentId)
        => new()
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = "credits",
            Credits = credits,
            AmountOre = amountOre,
            Description = $"{credits} {(credits == 1 ? "sökning" : "sökningar")}",
            ExternalPaymentId = externalPaymentId,
            CreatedAt = DateTime.UtcNow
        };

    public static CreditTransaction CreateSubscription(Guid userId, int amountOre, string? externalPaymentId)
        => new()
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = "subscription",
            Credits = null,
            AmountOre = amountOre,
            Description = "Månadsplan — obegränsade sökningar",
            ExternalPaymentId = externalPaymentId,
            CreatedAt = DateTime.UtcNow
        };

    public static CreditTransaction CreateTrial(Guid userId)
        => new()
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = "trial",
            Credits = 1,
            AmountOre = 0,
            Description = "Gratis provssökning vid kontoaktivering",
            ExternalPaymentId = null,
            CreatedAt = DateTime.UtcNow
        };
}
