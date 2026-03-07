namespace CarCheck.Domain.Entities;

public class PasswordReset
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string Token { get; private set; } = string.Empty;
    public DateTime ExpiresAt { get; private set; }
    public bool Used { get; private set; }

    private PasswordReset() { }

    public static PasswordReset Create(Guid userId, TimeSpan expiration)
    {
        if (userId == Guid.Empty)
            throw new ArgumentException("User ID is required.", nameof(userId));

        return new PasswordReset
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Token = Convert.ToBase64String(Guid.NewGuid().ToByteArray()),
            ExpiresAt = DateTime.UtcNow.Add(expiration),
            Used = false
        };
    }

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
