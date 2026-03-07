using System.Security.Claims;
using CarCheck.Application.Interfaces;

namespace CarCheck.API.Middleware;

public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private const int MaxRequestsPerMinute = 30;
    private static readonly TimeSpan Window = TimeSpan.FromMinutes(1);

    public RateLimitingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IRateLimitService rateLimitService)
    {
        var key = GetRateLimitKey(context);
        var result = await rateLimitService.CheckAsync(key, MaxRequestsPerMinute, Window);

        context.Response.Headers["X-RateLimit-Limit"] = result.Limit.ToString();
        context.Response.Headers["X-RateLimit-Remaining"] = result.Remaining.ToString();
        context.Response.Headers["X-RateLimit-Reset"] = result.ResetsAt.ToString("o");

        if (!result.IsAllowed)
        {
            context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
            context.Response.Headers["Retry-After"] = ((int)(result.ResetsAt - DateTime.UtcNow).TotalSeconds).ToString();
            await context.Response.WriteAsJsonAsync(new { error = "Too many requests. Please try again later." });
            return;
        }

        await _next(context);
    }

    private static string GetRateLimitKey(HttpContext context)
    {
        // Use user ID for authenticated requests, IP for anonymous
        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? context.User.FindFirst("sub")?.Value;

        if (userId is not null)
            return $"rl:user:{userId}";

        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return $"rl:ip:{ip}";
    }
}
