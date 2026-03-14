using System.Security.Claims;
using CarCheck.Application.Auth;
using CarCheck.Application.Auth.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace CarCheck.API.Endpoints;

public static class AuthEndpoints
{
    private const string RefreshTokenCookie = "__rt";

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

        group.MapPost("/login", async (LoginRequest request, AuthService authService, HttpContext httpContext) =>
        {
            var result = await authService.LoginAsync(request);
            if (!result.IsSuccess)
                return Results.BadRequest(new { error = "Felaktig e-postadress eller lösenord." });

            SetRefreshTokenCookie(httpContext, result.Value!.RefreshToken, httpContext.RequestServices.GetRequiredService<IWebHostEnvironment>());

            return Results.Ok(new AuthTokenResponse(result.Value.AccessToken, result.Value.ExpiresAt));
        })
        .WithName("Login")
        .AllowAnonymous();

        group.MapPost("/resend-verification", async (ResendVerificationRequest request, AuthService authService) =>
        {
            await authService.ResendVerificationAsync(request.Email);
            // Always 200 — no user enumeration
            return Results.Ok(new { message = "Om kontot finns och inte är verifierat skickas en ny länk." });
        })
        .WithName("ResendVerification")
        .AllowAnonymous();

        group.MapPost("/refresh", async (AuthService authService, HttpContext httpContext) =>
        {
            var refreshToken = httpContext.Request.Cookies[RefreshTokenCookie];
            if (string.IsNullOrEmpty(refreshToken))
                return Results.Unauthorized();

            var result = await authService.RefreshAsync(refreshToken);
            if (!result.IsSuccess)
            {
                ClearRefreshTokenCookie(httpContext);
                return Results.Unauthorized();
            }

            SetRefreshTokenCookie(httpContext, result.Value!.RefreshToken, httpContext.RequestServices.GetRequiredService<IWebHostEnvironment>());

            return Results.Ok(new AuthTokenResponse(result.Value.AccessToken, result.Value.ExpiresAt));
        })
        .WithName("RefreshToken")
        .AllowAnonymous();

        group.MapPost("/logout", async (AuthService authService, ClaimsPrincipal user, HttpContext httpContext) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            var refreshToken = httpContext.Request.Cookies[RefreshTokenCookie];
            ClearRefreshTokenCookie(httpContext);

            var result = await authService.LogoutAsync(userId.Value, refreshToken);
            return result.IsSuccess
                ? Results.Ok(new { message = "Du har loggats ut." })
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("Logout")
        .RequireAuthorization();

        group.MapPost("/logout-all", async (AuthService authService, ClaimsPrincipal user, HttpContext httpContext) =>
        {
            var userId = GetUserId(user);
            if (userId is null) return Results.Unauthorized();

            ClearRefreshTokenCookie(httpContext);

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

    private static void SetRefreshTokenCookie(HttpContext ctx, string token, IWebHostEnvironment env)
    {
        ctx.Response.Cookies.Append(RefreshTokenCookie, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = !env.IsDevelopment(),
            SameSite = env.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.None,
            Expires = DateTimeOffset.UtcNow.AddDays(7),
            Path = "/api/auth",
        });
    }

    private static void ClearRefreshTokenCookie(HttpContext ctx)
    {
        ctx.Response.Cookies.Delete(RefreshTokenCookie, new CookieOptions { Path = "/api/auth" });
    }

    private static Guid? GetUserId(ClaimsPrincipal user)
    {
        var claim = user.FindFirst(ClaimTypes.NameIdentifier)
            ?? user.FindFirst("sub");

        return claim is not null && Guid.TryParse(claim.Value, out var id) ? id : null;
    }
}
