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
                ? Results.Ok(new { message = "Du har loggats ut." })
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
                ? Results.Ok(new { message = "Alla sessioner har avslutats." })
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
                ? Results.Ok(new { message = "Lösenordet har ändrats." })
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("ChangePassword")
        .RequireAuthorization();

        group.MapPost("/forgot-password", async (PasswordResetRequest request, AuthService authService) =>
        {
            await authService.ForgotPasswordAsync(request);
            return Results.Ok(new { message = "Om e-postadressen finns registrerad skickas en återställningslänk." });
        })
        .WithName("ForgotPassword")
        .AllowAnonymous();

        group.MapPost("/reset-password", async (PasswordResetConfirmRequest request, AuthService authService) =>
        {
            var result = await authService.ResetPasswordAsync(request);
            return result.IsSuccess
                ? Results.Ok(new { message = "Lösenordet har återställts. Du kan nu logga in." })
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("ResetPassword")
        .AllowAnonymous();

        group.MapGet("/verify-email", async (string token, AuthService authService) =>
        {
            var result = await authService.VerifyEmailAsync(token);
            return result.IsSuccess
                ? Results.Ok(new { message = "E-postadressen är verifierad. Du har fått 1 gratis sökning!" })
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("VerifyEmail")
        .AllowAnonymous();
    }

    private static Guid? GetUserId(ClaimsPrincipal user)
    {
        var claim = user.FindFirst(ClaimTypes.NameIdentifier)
            ?? user.FindFirst("sub");

        return claim is not null && Guid.TryParse(claim.Value, out var id) ? id : null;
    }
}
