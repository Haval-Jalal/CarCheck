using System.Security.Claims;
using CarCheck.Application.Cars;
using CarCheck.Application.Cars.DTOs;
using CarCheck.Application.Interfaces;

namespace CarCheck.API.Endpoints;

public static class CarEndpoints
{
    public static void MapCarEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/cars").WithTags("Cars").RequireAuthorization();

        group.MapPost("/search", async (CarSearchRequest request, CarSearchService carSearchService, ICaptchaService captchaService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            if (request.CaptchaToken is not null)
            {
                var captchaValid = await captchaService.ValidateAsync(request.CaptchaToken);
                if (!captchaValid)
                    return Results.BadRequest(new { error = "CAPTCHA validation failed." });
            }

            var result = await carSearchService.SearchByRegistrationAsync(userId.Value, request);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.NotFound(new { error = result.Error });
        })
        .WithName("SearchCar");

        group.MapGet("/{carId:guid}", async (Guid carId, CarSearchService carSearchService) =>
        {
            var result = await carSearchService.GetCarByIdAsync(carId);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.NotFound(new { error = result.Error });
        })
        .WithName("GetCarById");

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
