using CarCheck.Domain.ValueObjects;

namespace CarCheck.Domain.Entities;

public class User
{
    private const int MaxFailedAttempts = 5;
    private static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(30);

    public Guid Id { get; private set; }
    public Email Email { get; private set; } = null!;
    public string PasswordHash { get; private set; } = string.Empty;
    public bool EmailVerified { get; private set; }
    public bool TwoFactorEnabled { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public int Credits { get; private set; }
    public bool TourCompleted { get; private set; }
    public int FailedLoginAttempts { get; private set; }
    public DateTime? LockoutUntil { get; private set; }

    private User() { }

    public static User Create(string email, string passwordHash)
    {
        if (string.IsNullOrWhiteSpace(passwordHash))
            throw new ArgumentException("Password hash is required.", nameof(passwordHash));

        return new User
        {
            Id = Guid.NewGuid(),
            Email = Email.Create(email),
            PasswordHash = passwordHash,
            EmailVerified = false,
            TwoFactorEnabled = false,
            CreatedAt = DateTime.UtcNow,
            FailedLoginAttempts = 0,
        };
    }

    public bool IsLockedOut() =>
        LockoutUntil.HasValue && LockoutUntil.Value > DateTime.UtcNow;

    public void RecordFailedLogin()
    {
        FailedLoginAttempts++;
        if (FailedLoginAttempts >= MaxFailedAttempts)
            LockoutUntil = DateTime.UtcNow.Add(LockoutDuration);
    }

    public void RecordSuccessfulLogin()
    {
        FailedLoginAttempts = 0;
        LockoutUntil = null;
    }

    public void VerifyEmail() => EmailVerified = true;

    public void CompleteTour() => TourCompleted = true;

    public void EnableTwoFactor() => TwoFactorEnabled = true;

    public void DisableTwoFactor() => TwoFactorEnabled = false;

    public void ChangePassword(string newPasswordHash)
    {
        if (string.IsNullOrWhiteSpace(newPasswordHash))
            throw new ArgumentException("Password hash is required.", nameof(newPasswordHash));

        PasswordHash = newPasswordHash;
    }

    public void AddCredits(int amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be positive.", nameof(amount));
        Credits += amount;
    }

    public bool ConsumeCredit()
    {
        if (Credits <= 0) return false;
        Credits--;
        return true;
    }
}
