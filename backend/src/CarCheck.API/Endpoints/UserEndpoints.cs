using System.Security.Claims;
using CarCheck.Domain.Interfaces;

namespace CarCheck.API.Endpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/user").WithTags("User").RequireAuthorization();

        // Called by the frontend once when the onboarding tour is dismissed or completed.
        // Persists the flag server-side so the tour does not appear again on other devices.
        group.MapPost("/complete-tour", async (IUserRepository userRepo, ClaimsPrincipal principal) =>
        {
            var sub = principal.FindFirstValue(ClaimTypes.NameIdentifier)
                   ?? principal.FindFirstValue("sub");

            if (!Guid.TryParse(sub, out var userId))
                return Results.Unauthorized();

            var user = await userRepo.GetByIdAsync(userId);
            if (user is null) return Results.Unauthorized();

            if (!user.TourCompleted)
            {
                user.CompleteTour();
                await userRepo.UpdateAsync(user);
            }

            return Results.Ok();
        })
        .WithName("CompleteTour");
    }
}
