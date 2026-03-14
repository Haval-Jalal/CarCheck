using System.Security.Cryptography;
using System.Text;

namespace CarCheck.Domain.Entities;

public class PasswordReset
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string TokenHash { get; private set; } = string.Empty;
    public DateTime ExpiresAt { get; private set; }
    public bool Used { get; private set; }

    private PasswordReset() { }

    /// <summary>
    /// Creates a new password reset. Returns the entity (with hashed token stored)
    /// and the raw token to include in the email link.
    /// </summary>
    public static (PasswordReset Reset, string RawToken) Create(Guid userId, TimeSpan expiration)
    {
        if (userId == Guid.Empty)
            throw new ArgumentException("User ID is required.", nameof(userId));

        var rawToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawToken)));

        return (new PasswordReset
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TokenHash = tokenHash,
            ExpiresAt = DateTime.UtcNow.Add(expiration),
            Used = false
        }, rawToken);
    }

    /// <summary>Hashes a raw token for lookup.</summary>
    public static string HashToken(string rawToken) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawToken)));

    public bool IsExpired() => DateTime.UtcNow > ExpiresAt;

    public void MarkUsed()
    {
        if (Used)
            throw new InvalidOperationException("Password reset token has already been used.");

        if (IsExpired())
            throw new InvalidOperationException("Password reset token has expired.");

        Used = true;
    }
}
