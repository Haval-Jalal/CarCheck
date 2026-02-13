using CarCheck.Domain.Enums;

namespace CarCheck.Domain.Entities;

public class Subscription
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public SubscriptionTier Tier { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime? EndDate { get; private set; }
    public bool IsActive { get; private set; }
    public string? ExternalSubscriptionId { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private Subscription() { }

    public static Subscription Create(Guid userId, SubscriptionTier tier, string? externalSubscriptionId = null)
    {
        if (userId == Guid.Empty)
            throw new ArgumentException("User ID is required.", nameof(userId));

        return new Subscription
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Tier = tier,
            StartDate = DateTime.UtcNow,
            EndDate = null,
            IsActive = true,
            ExternalSubscriptionId = externalSubscriptionId,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void Cancel()
    {
        IsActive = false;
        EndDate = DateTime.UtcNow;
    }

    public void Upgrade(SubscriptionTier newTier)
    {
        if (newTier <= Tier)
            throw new InvalidOperationException($"Cannot upgrade from {Tier} to {newTier}.");

        Tier = newTier;
    }

    public void Downgrade(SubscriptionTier newTier)
    {
        if (newTier >= Tier)
            throw new InvalidOperationException($"Cannot downgrade from {Tier} to {newTier}.");

        Tier = newTier;
    }

    public bool HasExpired() => EndDate.HasValue && EndDate.Value < DateTime.UtcNow;
}
