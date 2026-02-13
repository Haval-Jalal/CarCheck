using System.Diagnostics;
using System.Security.Claims;

namespace CarCheck.API.Middleware;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var requestId = Guid.NewGuid().ToString("N")[..12];

        context.Response.Headers["X-Request-Id"] = requestId;

        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? context.User.FindFirst("sub")?.Value
            ?? "anonymous";

        using (_logger.BeginScope(new Dictionary<string, object>
        {
            ["RequestId"] = requestId,
            ["UserId"] = userId,
            ["Method"] = context.Request.Method,
            ["Path"] = context.Request.Path.Value ?? ""
        }))
        {
            try
            {
                await _next(context);

                stopwatch.Stop();

                _logger.LogInformation(
                    "HTTP {Method} {Path} responded {StatusCode} in {ElapsedMs}ms",
                    context.Request.Method,
                    context.Request.Path.Value,
                    context.Response.StatusCode,
                    stopwatch.ElapsedMilliseconds);
            }
            catch (Exception ex)
            {
                stopwatch.Stop();

                _logger.LogError(ex,
                    "HTTP {Method} {Path} failed after {ElapsedMs}ms",
                    context.Request.Method,
                    context.Request.Path.Value,
                    stopwatch.ElapsedMilliseconds);

                throw;
            }
        }
    }
}
