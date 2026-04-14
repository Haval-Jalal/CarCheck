using CarCheck.Application.Interfaces;
using CarCheck.Domain.Entities;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CarCheck.Infrastructure.Persistence;

public class CarCheckDbContext : DbContext, IDataProtectionKeyContext
{
    public CarCheckDbContext(DbContextOptions<CarCheckDbContext> options) : base(options) { }

    public DbSet<DataProtectionKey> DataProtectionKeys => Set<DataProtectionKey>();

    public DbSet<User> Users => Set<User>();
    public DbSet<Car> Cars => Set<Car>();
    public DbSet<AnalysisResult> AnalysisResults => Set<AnalysisResult>();
    public DbSet<SearchHistory> SearchHistories => Set<SearchHistory>();
    public DbSet<Favorite> Favorites => Set<Favorite>();
    public DbSet<PasswordReset> PasswordResets => Set<PasswordReset>();
    public DbSet<EmailVerification> EmailVerifications => Set<EmailVerification>();
    public DbSet<CreditTransaction> CreditTransactions => Set<CreditTransaction>();
    public DbSet<SecurityEvent> SecurityEvents => Set<SecurityEvent>();
    public DbSet<RefreshTokenEntry> RefreshTokens => Set<RefreshTokenEntry>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<CompanyMember> CompanyMembers => Set<CompanyMember>();
    public DbSet<CompanyInvite> CompanyInvites => Set<CompanyInvite>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CarCheckDbContext).Assembly);
    }
}
