using CarCheck.Domain.Entities;
using CarCheck.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarCheck.Infrastructure.Persistence.Configurations;

public class CompanyMemberConfiguration : IEntityTypeConfiguration<CompanyMember>
{
    public void Configure(EntityTypeBuilder<CompanyMember> builder)
    {
        builder.ToTable("company_members");

        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id).HasColumnName("id");
        builder.Property(m => m.CompanyId).HasColumnName("company_id").IsRequired();
        builder.Property(m => m.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(m => m.Role).HasColumnName("role")
            .HasConversion(
                v => v.ToString().ToLowerInvariant(),
                v => Enum.Parse<CompanyMemberRole>(v, true))
            .HasMaxLength(20)
            .IsRequired();
        builder.Property(m => m.JoinedAt).HasColumnName("joined_at").IsRequired().HasDefaultValueSql("now()");

        // A user can only belong to one company
        builder.HasIndex(m => m.UserId).IsUnique().HasDatabaseName("ix_company_members_user_id");
        builder.HasIndex(m => m.CompanyId).HasDatabaseName("ix_company_members_company_id");
    }
}
