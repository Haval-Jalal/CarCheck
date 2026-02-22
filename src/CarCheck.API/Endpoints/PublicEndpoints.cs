using CarCheck.Application.Cars;

namespace CarCheck.API.Endpoints;

public static class PublicEndpoints
{
    public static void MapPublicEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/public").WithTags("Public");

        // Returns a car analysis without requiring authentication.
        // The carId GUID is unguessable, acting as a share token.
        group.MapGet("/cars/{carId:guid}/analysis", async (Guid carId, CarSearchService carSearchService) =>
        {
            var result = await carSearchService.AnalyzeCarAsync(carId);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.NotFound(new { error = result.Error });
        })
        .AllowAnonymous()
        .WithName("GetPublicCarAnalysis");
    }
}
