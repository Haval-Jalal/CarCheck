using System.Security.Claims;
using CarCheck.Application.Auth;
using CarCheck.Application.Auth.DTOs;

namespace CarCheck.API.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Authentication");

        group.MapPost("/register", async (RegisterRequest request, AuthService authService) =>
        {
            var result = await authService.RegisterAsync(request);
            return result.IsSuccess
                ? Results.Created($"/api/users/{result.Value!.Id}", result.Value)
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("Register")
        .AllowAnonymous();

        group.MapPost("/login", async (LoginRequest request, AuthService authService) =>
        {
            var result = await authService.LoginAsync(request);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.Unauthorized();
        })
        .WithName("Login")
        .AllowAnonymous();

        group.MapPost("/refresh", async (RefreshRequest request, AuthService authService) =>
        {
            var result = await authService.RefreshAsync(request);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.Unauthorized();
        })
        .WithName("RefreshToken")
        .AllowAnonymous();

        group.MapPost("/logout", async (RefreshRequest request, AuthService authService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var result = await authService.LogoutAsync(userId.Value, request.RefreshToken);
            return result.IsSuccess
                ? Results.Ok(new { message = "Logged out successfully." })
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("Logout")
        .RequireAuthorization();

        group.MapPost("/logout-all", async (AuthService authService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var result = await authService.LogoutAllAsync(userId.Value);
            return result.IsSuccess
                ? Results.Ok(new { message = "All sessions invalidated." })
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("LogoutAll")
        .RequireAuthorization();

        group.MapPost("/change-password", async (ChangePasswordRequest request, AuthService authService, ClaimsPrincipal user) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var result = await authService.ChangePasswordAsync(userId.Value, request);
            return result.IsSuccess
                ? Results.Ok(new { message = "Password changed successfully." })
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("ChangePassword")
        .RequireAuthorization();
    }

    private static Guid? GetUserId(ClaimsPrincipal user)
    {
        var claim = user.FindFirst(ClaimTypes.NameIdentifier)
            ?? user.FindFirst("sub");

        return claim is not null && Guid.TryParse(claim.Value, out var id) ? id : null;
    }
}
