using CarCheck.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarCheck.Infrastructure.Persistence.Configurations;

public class PasswordResetConfiguration : IEntityTypeConfiguration<PasswordReset>
{
    public void Configure(EntityTypeBuilder<PasswordReset> builder)
    {
        builder.ToTable("password_resets");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("id");

        builder.Property(p => p.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(p => p.Token)
            .HasColumnName("token")
            .HasMaxLength(512)
            .IsRequired();

        builder.Property(p => p.ExpiresAt)
            .HasColumnName("expires_at")
            .IsRequired();

        builder.Property(p => p.Used)
            .HasColumnName("used")
            .HasDefaultValue(false);

        builder.HasIndex(p => p.UserId);
        builder.HasIndex(p => p.Token);
    }
}
