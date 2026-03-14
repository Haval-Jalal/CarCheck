using System.Security.Claims;
using CarCheck.Application.Interfaces;

namespace CarCheck.API.Middleware;

public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;

    public RateLimitingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IRateLimitService rateLimitService)
    {
        var (limit, window) = GetRouteLimit(context);
        var key = GetRateLimitKey(context);
        var result = await rateLimitService.CheckAsync(key, limit, window);

        context.Response.Headers["X-RateLimit-Limit"] = result.Limit.ToString();
        context.Response.Headers["X-RateLimit-Remaining"] = result.Remaining.ToString();
        context.Response.Headers["X-RateLimit-Reset"] = result.ResetsAt.ToString("o");

        if (!result.IsAllowed)
        {
            context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
            context.Response.Headers["Retry-After"] = ((int)(result.ResetsAt - DateTime.UtcNow).TotalSeconds).ToString();
            await context.Response.WriteAsJsonAsync(new { error = "För många förfrågningar. Försök igen om en stund." });
            return;
        }

        await _next(context);
    }

    private static (int limit, TimeSpan window) GetRouteLimit(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLowerInvariant() ?? "";
        var isAuthenticated = context.User.Identity?.IsAuthenticated == true;

        if (!isAuthenticated)
        {
            if (path.StartsWith("/api/auth/login"))
                return (5, TimeSpan.FromMinutes(1));

            if (path.StartsWith("/api/auth/forgot-password"))
                return (5, TimeSpan.FromMinutes(1));

            if (path.StartsWith("/api/auth/register"))
                return (10, TimeSpan.FromMinutes(1));

            if (path.StartsWith("/api/public/"))
                return (15, TimeSpan.FromMinutes(1));
        }

        return (30, TimeSpan.FromMinutes(1));
    }

    private static string GetRateLimitKey(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLowerInvariant() ?? "";

        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? context.User.FindFirst("sub")?.Value;

        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        // For sensitive unauthenticated routes, always key by IP (not userId)
        if (!context.User.Identity?.IsAuthenticated == true &&
            (path.StartsWith("/api/auth/login") ||
             path.StartsWith("/api/auth/forgot-password") ||
             path.StartsWith("/api/auth/register") ||
             path.StartsWith("/api/public/")))
        {
            return $"rl:ip:{path.Split('/')[3]}:{ip}";
        }

        if (userId is not null)
            return $"rl:user:{userId}";

        return $"rl:ip:{ip}";
    }
}
