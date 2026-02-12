using CarCheck.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CarCheck.Infrastructure.Persistence;

public class CarCheckDbContext : DbContext
{
    public CarCheckDbContext(DbContextOptions<CarCheckDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Car> Cars => Set<Car>();
    public DbSet<AnalysisResult> AnalysisResults => Set<AnalysisResult>();
    public DbSet<SearchHistory> SearchHistories => Set<SearchHistory>();
    public DbSet<Favorite> Favorites => Set<Favorite>();
    public DbSet<PasswordReset> PasswordResets => Set<PasswordReset>();
    public DbSet<SecurityEvent> SecurityEvents => Set<SecurityEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CarCheckDbContext).Assembly);
    }
}
