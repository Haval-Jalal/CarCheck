using CarCheck.Domain.Entities;
using CarCheck.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarCheck.Infrastructure.Persistence.Configurations;

public class CompanyInviteConfiguration : IEntityTypeConfiguration<CompanyInvite>
{
    public void Configure(EntityTypeBuilder<CompanyInvite> builder)
    {
        builder.ToTable("company_invites");

        builder.HasKey(i => i.Id);
        builder.Property(i => i.Id).HasColumnName("id");
        builder.Property(i => i.CompanyId).HasColumnName("company_id").IsRequired();
        builder.Property(i => i.Email).HasColumnName("email").HasMaxLength(255).IsRequired();
        builder.Property(i => i.Role).HasColumnName("role")
            .HasConversion(
                v => v.ToString().ToLowerInvariant(),
                v => Enum.Parse<CompanyMemberRole>(v, true))
            .HasMaxLength(20)
            .IsRequired();
        builder.Property(i => i.Token).HasColumnName("token").HasMaxLength(128).IsRequired();
        builder.Property(i => i.ExpiresAt).HasColumnName("expires_at").IsRequired();
        builder.Property(i => i.UsedAt).HasColumnName("used_at");
        builder.Property(i => i.CreatedAt).HasColumnName("created_at").IsRequired().HasDefaultValueSql("now()");

        builder.HasIndex(i => i.Token).IsUnique().HasDatabaseName("ix_company_invites_token");
        builder.HasIndex(i => i.CompanyId).HasDatabaseName("ix_company_invites_company_id");
    }
}
