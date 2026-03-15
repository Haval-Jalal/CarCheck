using System.Text;
using CarCheck.API.Endpoints;
using CarCheck.API.Middleware;
using CarCheck.Infrastructure;
using CarCheck.Infrastructure.Auth;
using CarCheck.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ── JWT settings validation (VULN-009) ──────────────────────────────────────
var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()
    ?? new JwtSettings();

if (jwtSettings.Secret.Length < 32)
    throw new InvalidOperationException(
        "Jwt:Secret must be at least 32 characters. Set a strong secret in environment variables.");

builder.Services.AddOpenApi();
builder.Services.AddInfrastructure(builder.Configuration, builder.Environment.IsProduction());

// ── JWT Authentication ───────────────────────────────────────────────────────
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
            ValidateIssuer = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtSettings.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
        };
    });

builder.Services.AddAuthorization();

// ── CORS (VULN-007: specific methods/headers, VULN-001: credentials) ─────────
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
                builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
                    ?? ["http://localhost:5173"])
              .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
              .WithHeaders(
                  "Content-Type", "Authorization", "X-Requested-With")
              .WithExposedHeaders(
                  "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset",
                  "X-DailyQuota-Limit", "X-DailyQuota-Remaining", "X-Subscription-Tier",
                  "X-Request-Id")
              .AllowCredentials();
    });
});

// ── VULN-023: warn if Frontend:BaseUrl is not HTTPS ─────────────────────────
var frontendBaseUrl = builder.Configuration["Frontend:BaseUrl"] ?? string.Empty;
if (builder.Environment.IsProduction() &&
    !frontendBaseUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
{
    Console.Error.WriteLine(
        $"[SECURITY WARNING] Frontend:BaseUrl is not HTTPS ({frontendBaseUrl}). " +
        "Password-reset and verification links sent in emails may be insecure.");
}

var app = builder.Build();

// Auto-apply pending EF migrations on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<CarCheckDbContext>();
    await db.Database.MigrateAsync();
}

// ── Swagger only in development (VULN-016) ───────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// ── Security headers middleware (VULN-002) ───────────────────────────────────
app.Use(async (context, next) =>
{
    var headers = context.Response.Headers;
    headers["X-Content-Type-Options"] = "nosniff";
    headers["X-Frame-Options"] = "DENY";
    headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()";

    // HSTS — always set in production (Render terminates TLS at proxy, so IsHttps is always false internally)
    if (app.Environment.IsProduction())
        headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";

    headers["Content-Security-Policy"] =
        "default-src 'none'; " +
        "frame-ancestors 'none'; " +
        "form-action 'none'";

    await next();
});

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseMiddleware<RequestLoggingMiddleware>();
// HttpsRedirection is intentionally omitted — Render handles TLS termination at the proxy level
app.UseCors();
app.UseMiddleware<RateLimitingMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<DailyQuotaMiddleware>();

app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }))
    .WithName("HealthCheck");

app.MapAuthEndpoints();
app.MapCarEndpoints();
app.MapHistoryEndpoints();
app.MapFavoriteEndpoints();
app.MapBillingEndpoints();
app.MapGdprEndpoints();
app.MapUserEndpoints();
app.MapPublicEndpoints();

app.Run();
