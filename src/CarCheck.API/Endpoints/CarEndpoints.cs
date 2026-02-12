using System.Security.Claims;
using CarCheck.Application.Cars;
using CarCheck.Application.Cars.DTOs;

namespace CarCheck.API.Endpoints;

public static class CarEndpoints
{
    public static void MapCarEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/cars").WithTags("Cars").RequireAuthorization();

        group.MapPost("/search", async (CarSearchRequest request, CarSearchService carSearchService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var result = await carSearchService.SearchByRegistrationAsync(userId.Value, request);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.NotFound(new { error = result.Error });
        })
        .WithName("SearchCar");

        group.MapGet("/{carId:guid}/analysis", async (Guid carId, CarSearchService carSearchService) =>
        {
            var result = await carSearchService.AnalyzeCarAsync(carId);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.NotFound(new { error = result.Error });
        })
        .WithName("AnalyzeCar");
    }

    private static Guid? GetUserId(ClaimsPrincipal user)
    {
        var claim = user.FindFirst(ClaimTypes.NameIdentifier)
            ?? user.FindFirst("sub");

        return claim is not null && Guid.TryParse(claim.Value, out var id) ? id : null;
    }
}
