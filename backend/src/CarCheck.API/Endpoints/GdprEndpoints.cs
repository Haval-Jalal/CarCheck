using System.Security.Claims;
using CarCheck.Application.Gdpr;
using Microsoft.AspNetCore.Mvc;

namespace CarCheck.API.Endpoints;

public static class GdprEndpoints
{
    record DeleteAccountRequest(string Password, string? Reason);

    public static void MapGdprEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/gdpr").WithTags("GDPR").RequireAuthorization();

        group.MapGet("/export", async (GdprService gdprService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var result = await gdprService.ExportUserDataAsync(userId.Value);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("ExportUserData");

        group.MapDelete("/delete-account", async ([FromBody] DeleteAccountRequest request, GdprService gdprService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var result = await gdprService.RequestDataDeletionAsync(userId.Value, request.Password, request.Reason);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("DeleteAccount");
    }

    private static Guid? GetUserId(ClaimsPrincipal user)
    {
        var claim = user.FindFirst(ClaimTypes.NameIdentifier)
            ?? user.FindFirst("sub");

        return claim is not null && Guid.TryParse(claim.Value, out var id) ? id : null;
    }
}
