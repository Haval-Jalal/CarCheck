using CarCheck.Domain.Enums;

namespace CarCheck.Application.Company.DTOs;

public record CreateCompanyRequest(string Name, string? OrgNumber);

public record InviteMemberRequest(string Email, CompanyMemberRole Role);

public record CompanyResponse(
    Guid Id,
    string Name,
    string? OrgNumber,
    string? LogoUrl,
    DateTime CreatedAt,
    IReadOnlyList<CompanyMemberResponse> Members,
    IReadOnlyList<PendingInviteResponse> PendingInvites);

public record CompanyMemberResponse(
    Guid MemberId,
    Guid UserId,
    string Email,
    CompanyMemberRole Role,
    DateTime JoinedAt);

public record PendingInviteResponse(
    Guid InviteId,
    string Email,
    CompanyMemberRole Role,
    DateTime ExpiresAt,
    DateTime CreatedAt);

public record AcceptInviteRequest(string Token);
