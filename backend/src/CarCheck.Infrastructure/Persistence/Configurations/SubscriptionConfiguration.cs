using CarCheck.Domain.Entities;
using CarCheck.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarCheck.Infrastructure.Persistence.Configurations;

public class SubscriptionConfiguration : IEntityTypeConfiguration<Subscription>
{
    public void Configure(EntityTypeBuilder<Subscription> builder)
    {
        builder.ToTable("subscriptions");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasColumnName("id");
        builder.Property(s => s.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(s => s.Tier).HasColumnName("tier")
            .HasConversion(
                v => v.ToString().ToLowerInvariant(),
                v => Enum.Parse<SubscriptionTier>(v, true))
            .HasMaxLength(20)
            .IsRequired();
        builder.Property(s => s.StartDate).HasColumnName("start_date").IsRequired();
        builder.Property(s => s.EndDate).HasColumnName("end_date");
        builder.Property(s => s.IsActive).HasColumnName("is_active").IsRequired();
        builder.Property(s => s.ExternalSubscriptionId).HasColumnName("external_subscription_id").HasMaxLength(255);
        builder.Property(s => s.CreatedAt).HasColumnName("created_at").IsRequired().HasDefaultValueSql("now()");

        builder.HasIndex(s => s.UserId).HasDatabaseName("ix_subscriptions_user_id");
        builder.HasIndex(s => new { s.UserId, s.IsActive }).HasDatabaseName("ix_subscriptions_user_active");
    }
}
