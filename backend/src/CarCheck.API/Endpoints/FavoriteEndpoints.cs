using System.Security.Claims;
using CarCheck.Application.Favorites;
using CarCheck.Application.Favorites.DTOs;

namespace CarCheck.API.Endpoints;

public static class FavoriteEndpoints
{
    public static void MapFavoriteEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/favorites").WithTags("Favorites").RequireAuthorization();

        group.MapGet("/", async (int? page, int? pageSize, FavoriteService favoriteService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var result = await favoriteService.GetFavoritesAsync(userId.Value, page ?? 1, pageSize ?? 20);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("GetFavorites");

        group.MapPost("/", async (AddFavoriteRequest request, FavoriteService favoriteService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var result = await favoriteService.AddFavoriteAsync(userId.Value, request);
            return result.IsSuccess
                ? Results.Created($"/api/favorites/{result.Value!.CarId}", result.Value)
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("AddFavorite");

        group.MapGet("/{carId:guid}/check", async (Guid carId, FavoriteService favoriteService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var result = await favoriteService.CheckFavoriteAsync(userId.Value, carId);
            return Results.Ok(new { isFavorite = result.Value });
        })
        .WithName("CheckFavorite");

        group.MapDelete("/{carId:guid}", async (Guid carId, FavoriteService favoriteService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var result = await favoriteService.RemoveFavoriteAsync(userId.Value, carId);
            return result.IsSuccess
                ? Results.Ok(new { message = "Favorite removed." })
                : Results.NotFound(new { error = result.Error });
        })
        .WithName("RemoveFavorite");
    }

    private static Guid? GetUserId(ClaimsPrincipal user)
    {
        var claim = user.FindFirst(ClaimTypes.NameIdentifier)
            ?? user.FindFirst("sub");

        return claim is not null && Guid.TryParse(claim.Value, out var id) ? id : null;
    }
}
