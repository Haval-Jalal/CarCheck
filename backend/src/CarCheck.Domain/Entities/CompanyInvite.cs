using CarCheck.Domain.Enums;

namespace CarCheck.Domain.Entities;

public class CompanyInvite
{
    public Guid Id { get; private set; }
    public Guid CompanyId { get; private set; }
    public string Email { get; private set; } = string.Empty;
    public CompanyMemberRole Role { get; private set; }
    public string Token { get; private set; } = string.Empty;
    public DateTime ExpiresAt { get; private set; }
    public DateTime? UsedAt { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private CompanyInvite() { }

    public static CompanyInvite Create(Guid companyId, string email, CompanyMemberRole role, string token)
    {
        if (companyId == Guid.Empty)
            throw new ArgumentException("CompanyId is required.", nameof(companyId));
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email is required.", nameof(email));
        if (string.IsNullOrWhiteSpace(token))
            throw new ArgumentException("Token is required.", nameof(token));

        return new CompanyInvite
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            Email = email.Trim().ToLowerInvariant(),
            Role = role,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(48),
            CreatedAt = DateTime.UtcNow
        };
    }

    public bool IsValid() => UsedAt is null && ExpiresAt > DateTime.UtcNow;

    public void MarkUsed() => UsedAt = DateTime.UtcNow;
}
