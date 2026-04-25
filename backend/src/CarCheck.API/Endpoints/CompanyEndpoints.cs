using System.Security.Claims;
using System.Text;
using CarCheck.Application.Company;
using CarCheck.Application.Company.DTOs;
using CarCheck.Domain.Interfaces;

namespace CarCheck.API.Endpoints;

public static class CompanyEndpoints
{
    public static void MapCompanyEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/company").WithTags("Company").RequireAuthorization();

        // Create a new company (creator becomes Admin)
        group.MapPost("/", async (CreateCompanyRequest request, CompanyService companyService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var result = await companyService.CreateCompanyAsync(userId.Value, request);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("CreateCompany");

        // Get current user's company (with members and pending invites)
        group.MapGet("/", async (CompanyService companyService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var result = await companyService.GetCompanyAsync(userId.Value);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.NotFound(new { error = result.Error });
        })
        .WithName("GetCompany");

        // Invite a member (Admin only)
        group.MapPost("/invite", async (InviteMemberRequest request, CompanyService companyService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var result = await companyService.SendInviteAsync(userId.Value, request);
            return result.IsSuccess
                ? Results.Ok(new { message = "Inbjudan har skickats." })
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("InviteMember");

        // Accept an invite (the invited user, must be authenticated)
        group.MapPost("/accept-invite", async (AcceptInviteRequest request, CompanyService companyService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var result = await companyService.AcceptInviteAsync(userId.Value, request.Token);
            return result.IsSuccess
                ? Results.Ok(new { message = "Du har gått med i företaget." })
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("AcceptInvite");

        // Remove a member (Admin only)
        group.MapDelete("/members/{memberId:guid}", async (Guid memberId, CompanyService companyService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var result = await companyService.RemoveMemberAsync(userId.Value, memberId);
            return result.IsSuccess
                ? Results.Ok(new { message = "Medlemmen har tagits bort." })
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("RemoveMember");

        // Export company search history as CSV (any company member)
        group.MapGet("/export-history",
            async (CompanyService companyService, ICompanyMemberRepository memberRepo,
                   ISearchHistoryRepository historyRepo, ICarRepository carRepo,
                   ClaimsPrincipal user, CancellationToken ct) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var companyResult = await companyService.GetCompanyAsync(userId.Value);
            if (!companyResult.IsSuccess) return Results.NotFound(new { error = "Du tillhör inget företag." });

            var company = companyResult.Value!;
            var memberIds = company.Members.Select(m => m.MemberId);

            var entries = await historyRepo.GetAllByUserIdsAsync(memberIds, ct);

            var sb = new StringBuilder();
            sb.AppendLine("Datum,Regnummer,Märke,Modell,År,Sökare");

            foreach (var entry in entries)
            {
                var car = await carRepo.GetByIdAsync(entry.CarId, ct);
                var member = company.Members.FirstOrDefault(m => m.MemberId == entry.UserId);
                sb.AppendLine(string.Join(",",
                    entry.SearchedAt.ToString("yyyy-MM-dd HH:mm"),
                    car?.RegistrationNumber.Value ?? "",
                    EscapeCsv(car?.Brand ?? ""),
                    EscapeCsv(car?.Model ?? ""),
                    car?.Year.ToString() ?? "",
                    EscapeCsv(member?.Email ?? "")
                ));
            }

            var fileName = $"carcheck-historik-{DateTime.UtcNow:yyyy-MM-dd}.csv";
            var bytes = Encoding.UTF8.GetBytes(sb.ToString());
            return Results.File(bytes, "text/csv; charset=utf-8", fileName);
        })
        .WithName("ExportCompanyHistory");
    }

    private static Guid? GetUserId(ClaimsPrincipal user)
    {
        var claim = user.FindFirst(ClaimTypes.NameIdentifier) ?? user.FindFirst("sub");
        return claim is not null && Guid.TryParse(claim.Value, out var id) ? id : null;
    }

    private static string EscapeCsv(string value)
    {
        if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
            return $"\"{value.Replace("\"", "\"\"")}\"";
        return value;
    }
}
