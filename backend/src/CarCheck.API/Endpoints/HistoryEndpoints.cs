using System.Security.Claims;
using CarCheck.Application.History;

namespace CarCheck.API.Endpoints;

public static class HistoryEndpoints
{
    public static void MapHistoryEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/history").WithTags("Search History").RequireAuthorization();

        group.MapGet("/", async (int? page, int? pageSize, SearchHistoryService historyService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var result = await historyService.GetHistoryAsync(userId.Value, page ?? 1, pageSize ?? 20);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("GetSearchHistory");

        group.MapDelete("/{id:guid}", async (Guid id, SearchHistoryService historyService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var result = await historyService.DeleteEntryAsync(userId.Value, id);
            return result.IsSuccess
                ? Results.Ok(new { message = "Entry deleted." })
                : Results.NotFound(new { error = result.Error });
        })
        .WithName("DeleteHistoryEntry");

        group.MapDelete("/", async (SearchHistoryService historyService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var result = await historyService.ClearHistoryAsync(userId.Value);
            return Results.Ok(new { message = "History cleared." });
        })
        .WithName("ClearHistory");
    }

    private static Guid? GetUserId(ClaimsPrincipal user)
    {
        var claim = user.FindFirst(ClaimTypes.NameIdentifier)
            ?? user.FindFirst("sub");

        return claim is not null && Guid.TryParse(claim.Value, out var id) ? id : null;
    }
}
