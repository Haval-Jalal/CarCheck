using System.Security.Claims;
using CarCheck.Application.Cars;
using CarCheck.Application.Cars.DTOs;
using CarCheck.Domain.Enums;
using CarCheck.Domain.Interfaces;

namespace CarCheck.API.Endpoints;

public static class BusinessEndpoints
{
    private const int MaxBulkSearchCount = 50;

    public static void MapBusinessEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/business").WithTags("Business").RequireAuthorization();

        group.MapPost("/bulk-search", async (
            BulkSearchRequest request,
            CarSearchService carSearchService,
            ISubscriptionRepository subscriptionRepository,
            ClaimsPrincipal user,
            CancellationToken cancellationToken) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var subscription = await subscriptionRepository.GetActiveByUserIdAsync(userId.Value, cancellationToken);
            if (subscription is null || !subscription.IsActive || subscription.Tier != SubscriptionTier.Business)
                return Results.Json(new { error = "Bulksökning kräver ett aktivt Business-abonnemang." }, statusCode: 403);

            if (request.RegistrationNumbers is null || request.RegistrationNumbers.Count == 0)
                return Results.BadRequest(new { error = "Ange minst ett registreringsnummer." });

            var distinct = request.RegistrationNumbers
                .Select(r => r.Trim().ToUpperInvariant())
                .Where(r => !string.IsNullOrEmpty(r))
                .Distinct()
                .Take(MaxBulkSearchCount)
                .ToList();

            var tasks = distinct.Select(async regNum =>
            {
                var searchRequest = new CarSearchRequest(regNum);
                var result = await carSearchService.SearchByRegistrationAsync(userId.Value, searchRequest, cancellationToken);
                return new BulkSearchItemResult(
                    RegistrationNumber: regNum,
                    Success: result.IsSuccess,
                    CarId: result.IsSuccess ? result.Value.CarId : null,
                    Brand: result.IsSuccess ? result.Value.Brand : null,
                    Model: result.IsSuccess ? result.Value.Model : null,
                    Year: result.IsSuccess ? result.Value.Year : null,
                    Mileage: result.IsSuccess ? result.Value.Mileage : null,
                    MarketValueSek: result.IsSuccess ? result.Value.MarketValueSek : null,
                    Error: result.IsSuccess ? null : result.Error);
            });

            var results = await Task.WhenAll(tasks);

            return Results.Ok(new BulkSearchResponse(
                Total: distinct.Count,
                Succeeded: results.Count(r => r.Success),
                Failed: results.Count(r => !r.Success),
                Results: results));
        })
        .WithName("BulkSearchCars");
    }

    private static Guid? GetUserId(ClaimsPrincipal user)
    {
        var claim = user.FindFirst(ClaimTypes.NameIdentifier)
            ?? user.FindFirst("sub");

        return claim is not null && Guid.TryParse(claim.Value, out var id) ? id : null;
    }
}

public record BulkSearchRequest(List<string> RegistrationNumbers);

public record BulkSearchResponse(
    int Total,
    int Succeeded,
    int Failed,
    IEnumerable<BulkSearchItemResult> Results);

public record BulkSearchItemResult(
    string RegistrationNumber,
    bool Success,
    Guid? CarId,
    string? Brand,
    string? Model,
    int? Year,
    int? Mileage,
    decimal? MarketValueSek,
    string? Error);
