using CarCheck.Domain.Enums;

namespace CarCheck.Domain.Entities;

public class CompanyMember
{
    public Guid Id { get; private set; }
    public Guid CompanyId { get; private set; }
    public Guid UserId { get; private set; }
    public CompanyMemberRole Role { get; private set; }
    public DateTime JoinedAt { get; private set; }

    private CompanyMember() { }

    public static CompanyMember Create(Guid companyId, Guid userId, CompanyMemberRole role)
    {
        if (companyId == Guid.Empty)
            throw new ArgumentException("CompanyId is required.", nameof(companyId));
        if (userId == Guid.Empty)
            throw new ArgumentException("UserId is required.", nameof(userId));

        return new CompanyMember
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            UserId = userId,
            Role = role,
            JoinedAt = DateTime.UtcNow
        };
    }

    public void ChangeRole(CompanyMemberRole newRole) => Role = newRole;
}
