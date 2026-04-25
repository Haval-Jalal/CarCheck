using CarCheck.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarCheck.Infrastructure.Persistence.Configurations;

public class FleetVehicleConfiguration : IEntityTypeConfiguration<FleetVehicle>
{
    public void Configure(EntityTypeBuilder<FleetVehicle> builder)
    {
        builder.ToTable("fleet_vehicles");

        builder.HasKey(f => f.Id);
        builder.Property(f => f.Id).HasColumnName("id");
        builder.Property(f => f.CompanyId).HasColumnName("company_id").IsRequired();
        builder.Property(f => f.RegistrationNumber).HasColumnName("registration_number").HasMaxLength(20).IsRequired();
        builder.Property(f => f.Nickname).HasColumnName("nickname").HasMaxLength(100);
        builder.Property(f => f.AddedByUserId).HasColumnName("added_by_user_id").IsRequired();
        builder.Property(f => f.AddedAt).HasColumnName("added_at").IsRequired().HasDefaultValueSql("now()");

        builder.HasIndex(f => f.CompanyId).HasDatabaseName("ix_fleet_vehicles_company_id");
        builder.HasIndex(f => new { f.CompanyId, f.RegistrationNumber })
            .IsUnique()
            .HasDatabaseName("ix_fleet_vehicles_company_reg");
    }
}
