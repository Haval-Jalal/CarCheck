using System.Security.Claims;
using CarCheck.Application.Company;
using CarCheck.Application.Company.DTOs;

namespace CarCheck.API.Endpoints;

public static class FleetEndpoints
{
    public static void MapFleetEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/fleet").WithTags("Fleet").RequireAuthorization();

        group.MapGet("/", async (FleetService fleetService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var result = await fleetService.GetFleetAsync(userId.Value);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("GetFleet");

        group.MapPost("/", async (AddFleetVehicleRequest request, FleetService fleetService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var result = await fleetService.AddVehicleAsync(userId.Value, request);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("AddFleetVehicle");

        group.MapDelete("/{vehicleId:guid}", async (Guid vehicleId, FleetService fleetService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var result = await fleetService.RemoveVehicleAsync(userId.Value, vehicleId);
            return result.IsSuccess
                ? Results.Ok(new { message = "Fordonet har tagits bort." })
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("RemoveFleetVehicle");
    }

    private static Guid? GetUserId(ClaimsPrincipal user)
    {
        var claim = user.FindFirst(ClaimTypes.NameIdentifier) ?? user.FindFirst("sub");
        return claim is not null && Guid.TryParse(claim.Value, out var id) ? id : null;
    }
}
