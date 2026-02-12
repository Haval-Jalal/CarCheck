using CarCheck.Domain.Entities;
using CarCheck.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarCheck.Infrastructure.Persistence.Configurations;

public class CarConfiguration : IEntityTypeConfiguration<Car>
{
    public void Configure(EntityTypeBuilder<Car> builder)
    {
        builder.ToTable("cars");

        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasColumnName("id");

        builder.Property(c => c.RegistrationNumber)
            .HasColumnName("registration_number")
            .HasMaxLength(20)
            .IsRequired()
            .HasConversion(
                r => r.Value,
                v => RegistrationNumber.Create(v));

        builder.HasIndex(c => c.RegistrationNumber).IsUnique();

        builder.Property(c => c.Brand)
            .HasColumnName("brand")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(c => c.Model)
            .HasColumnName("model")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(c => c.Year)
            .HasColumnName("year")
            .IsRequired();

        builder.Property(c => c.Mileage)
            .HasColumnName("mileage")
            .IsRequired();
    }
}
