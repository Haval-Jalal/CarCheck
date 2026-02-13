using CarCheck.Application.Auth;
using CarCheck.Application.Billing;
using CarCheck.Application.Cars;
using CarCheck.Application.Favorites;
using CarCheck.Application.History;
using CarCheck.Application.Interfaces;
using CarCheck.Domain.Interfaces;
using CarCheck.Infrastructure.Auth;
using CarCheck.Infrastructure.Caching;
using CarCheck.Infrastructure.External;
using CarCheck.Infrastructure.RateLimiting;
using CarCheck.Infrastructure.Persistence;
using CarCheck.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CarCheck.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        services.AddDbContext<CarCheckDbContext>(options =>
            options.UseNpgsql(connectionString));

        // Repositories
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ICarRepository, CarRepository>();
        services.AddScoped<IAnalysisResultRepository, AnalysisResultRepository>();
        services.AddScoped<ISearchHistoryRepository, SearchHistoryRepository>();
        services.AddScoped<IFavoriteRepository, FavoriteRepository>();

        // Auth
        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));
        services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();
        services.AddScoped<ITokenService, JwtTokenService>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<ISecurityEventLogger, SecurityEventLogger>();
        services.AddScoped<AuthService>();

        // Caching
        services.AddMemoryCache();
        services.AddSingleton<ICacheService, InMemoryCacheService>();

        // Car data provider (swap to real API in production)
        services.AddScoped<ICarDataProvider, MockCarDataProvider>();

        // Car services
        services.AddScoped<CarAnalysisEngine>();
        services.AddScoped<CarSearchService>();

        // History & Favorites
        services.AddScoped<SearchHistoryService>();
        services.AddScoped<FavoriteService>();

        // Rate limiting & CAPTCHA
        services.AddSingleton<IRateLimitService, InMemoryRateLimitService>();
        services.AddScoped<ICaptchaService, MockCaptchaService>();

        // Billing & Subscriptions
        services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();
        services.AddScoped<IBillingProvider, MockBillingProvider>();
        services.AddScoped<SubscriptionService>();

        return services;
    }
}
