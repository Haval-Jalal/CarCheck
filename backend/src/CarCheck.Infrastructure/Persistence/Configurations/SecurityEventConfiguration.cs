using CarCheck.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarCheck.Infrastructure.Persistence.Configurations;

public class SecurityEventConfiguration : IEntityTypeConfiguration<SecurityEvent>
{
    public void Configure(EntityTypeBuilder<SecurityEvent> builder)
    {
        builder.ToTable("security_events");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasColumnName("id");

        builder.Property(s => s.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(s => s.Type)
            .HasColumnName("type")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(s => s.Metadata)
            .HasColumnName("metadata")
            .HasColumnType("jsonb");

        builder.Property(s => s.CreatedAt)
            .HasColumnName("created_at")
            .HasDefaultValueSql("NOW()");

        builder.HasIndex(s => s.UserId);
        builder.HasIndex(s => s.CreatedAt);
    }
}
