using System.Security.Cryptography;
using CarCheck.Application.Auth;
using CarCheck.Application.Company.DTOs;
using CarCheck.Application.Interfaces;
using CarCheck.Domain.Entities;
using CarCheck.Domain.Enums;
using CarCheck.Domain.Interfaces;

namespace CarCheck.Application.Company;

public class CompanyService
{
    private readonly ICompanyRepository _companyRepository;
    private readonly ICompanyMemberRepository _memberRepository;
    private readonly ICompanyInviteRepository _inviteRepository;
    private readonly IUserRepository _userRepository;
    private readonly IEmailService _emailService;

    public CompanyService(
        ICompanyRepository companyRepository,
        ICompanyMemberRepository memberRepository,
        ICompanyInviteRepository inviteRepository,
        IUserRepository userRepository,
        IEmailService emailService)
    {
        _companyRepository = companyRepository;
        _memberRepository = memberRepository;
        _inviteRepository = inviteRepository;
        _userRepository = userRepository;
        _emailService = emailService;
    }

    public async Task<Result<CompanyResponse>> CreateCompanyAsync(
        Guid userId, CreateCompanyRequest request, CancellationToken cancellationToken = default)
    {
        // User must not already belong to a company
        var existingMembership = await _memberRepository.GetByUserIdAsync(userId, cancellationToken);
        if (existingMembership is not null)
            return Result<CompanyResponse>.Failure("Du tillhör redan ett företag.");

        var company = Domain.Entities.Company.Create(request.Name, userId, request.OrgNumber);
        await _companyRepository.AddAsync(company, cancellationToken);

        var adminMember = CompanyMember.Create(company.Id, userId, CompanyMemberRole.Admin);
        await _memberRepository.AddAsync(adminMember, cancellationToken);

        return Result<CompanyResponse>.Success(await BuildResponseAsync(company, cancellationToken));
    }

    public async Task<Result<CompanyResponse>> GetCompanyAsync(
        Guid userId, CancellationToken cancellationToken = default)
    {
        var company = await _companyRepository.GetByUserIdAsync(userId, cancellationToken);
        if (company is null)
            return Result<CompanyResponse>.Failure("Du tillhör inget företag.");

        return Result<CompanyResponse>.Success(await BuildResponseAsync(company, cancellationToken));
    }

    public async Task<Result<bool>> SendInviteAsync(
        Guid adminUserId, InviteMemberRequest request, CancellationToken cancellationToken = default)
    {
        var membership = await _memberRepository.GetByUserIdAsync(adminUserId, cancellationToken);
        if (membership is null || membership.Role != CompanyMemberRole.Admin)
            return Result<bool>.Failure("Du har inte behörighet att bjuda in medlemmar.");

        var company = await _companyRepository.GetByIdAsync(membership.CompanyId, cancellationToken);
        if (company is null)
            return Result<bool>.Failure("Företaget hittades inte.");

        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        var invite = CompanyInvite.Create(company.Id, request.Email, request.Role, token);
        await _inviteRepository.AddAsync(invite, cancellationToken);

        await _emailService.SendCompanyInviteAsync(
            request.Email, company.Name, token, request.Role, cancellationToken);

        return Result<bool>.Success(true);
    }

    public async Task<Result<bool>> AcceptInviteAsync(
        Guid userId, string token, CancellationToken cancellationToken = default)
    {
        var invite = await _inviteRepository.GetByTokenAsync(token, cancellationToken);
        if (invite is null || !invite.IsValid())
            return Result<bool>.Failure("Inbjudan är ogiltig eller har gått ut.");

        // User must not already belong to a company
        var existingMembership = await _memberRepository.GetByUserIdAsync(userId, cancellationToken);
        if (existingMembership is not null)
            return Result<bool>.Failure("Du tillhör redan ett företag.");

        var member = CompanyMember.Create(invite.CompanyId, userId, invite.Role);
        await _memberRepository.AddAsync(member, cancellationToken);

        invite.MarkUsed();
        await _inviteRepository.UpdateAsync(invite, cancellationToken);

        return Result<bool>.Success(true);
    }

    public async Task<Result<bool>> RemoveMemberAsync(
        Guid adminUserId, Guid targetMemberId, CancellationToken cancellationToken = default)
    {
        var adminMembership = await _memberRepository.GetByUserIdAsync(adminUserId, cancellationToken);
        if (adminMembership is null || adminMembership.Role != CompanyMemberRole.Admin)
            return Result<bool>.Failure("Du har inte behörighet att ta bort medlemmar.");

        var members = await _memberRepository.GetByCompanyIdAsync(adminMembership.CompanyId, cancellationToken);
        var target = members.FirstOrDefault(m => m.Id == targetMemberId);
        if (target is null)
            return Result<bool>.Failure("Medlemmen hittades inte.");

        if (target.UserId == adminUserId)
            return Result<bool>.Failure("Du kan inte ta bort dig själv.");

        await _memberRepository.DeleteAsync(target, cancellationToken);
        return Result<bool>.Success(true);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private async Task<CompanyResponse> BuildResponseAsync(
        Domain.Entities.Company company, CancellationToken cancellationToken)
    {
        var members = await _memberRepository.GetByCompanyIdAsync(company.Id, cancellationToken);
        var pendingInvites = await _inviteRepository.GetPendingByCompanyIdAsync(company.Id, cancellationToken);

        var memberResponses = new List<CompanyMemberResponse>();
        foreach (var m in members)
        {
            var user = await _userRepository.GetByIdAsync(m.UserId, cancellationToken);
            memberResponses.Add(new CompanyMemberResponse(
                m.Id, m.UserId, user?.Email.Value ?? "", m.Role, m.JoinedAt));
        }

        var inviteResponses = pendingInvites
            .Select(i => new PendingInviteResponse(i.Id, i.Email, i.Role, i.ExpiresAt, i.CreatedAt))
            .ToList();

        return new CompanyResponse(
            company.Id, company.Name, company.OrgNumber, company.LogoUrl,
            company.CreatedAt, memberResponses, inviteResponses);
    }
}
