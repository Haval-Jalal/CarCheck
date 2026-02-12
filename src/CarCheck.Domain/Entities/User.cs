using CarCheck.Domain.ValueObjects;

namespace CarCheck.Domain.Entities;

public class User
{
    public Guid Id { get; private set; }
    public Email Email { get; private set; } = null!;
    public string PasswordHash { get; private set; } = string.Empty;
    public bool EmailVerified { get; private set; }
    public bool TwoFactorEnabled { get; private set; }
    public DateTime CreatedAt { get; private set; }

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
            CreatedAt = DateTime.UtcNow
        };
    }

    public void VerifyEmail() => EmailVerified = true;

    public void EnableTwoFactor() => TwoFactorEnabled = true;

    public void DisableTwoFactor() => TwoFactorEnabled = false;

    public void ChangePassword(string newPasswordHash)
    {
        if (string.IsNullOrWhiteSpace(newPasswordHash))
            throw new ArgumentException("Password hash is required.", nameof(newPasswordHash));

        PasswordHash = newPasswordHash;
    }
}
