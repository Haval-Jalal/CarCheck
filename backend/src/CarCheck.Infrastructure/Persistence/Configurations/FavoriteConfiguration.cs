using CarCheck.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarCheck.Infrastructure.Persistence.Configurations;

public class FavoriteConfiguration : IEntityTypeConfiguration<Favorite>
{
    public void Configure(EntityTypeBuilder<Favorite> builder)
    {
        builder.ToTable("favorites");

        builder.HasKey(f => f.Id);
        builder.Property(f => f.Id).HasColumnName("id");

        builder.Property(f => f.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(f => f.CarId)
            .HasColumnName("car_id")
            .IsRequired();

        builder.Property(f => f.CreatedAt)
            .HasColumnName("created_at")
            .HasDefaultValueSql("NOW()");

        builder.HasIndex(f => new { f.UserId, f.CarId }).IsUnique();
        builder.HasIndex(f => f.UserId);
    }
}
