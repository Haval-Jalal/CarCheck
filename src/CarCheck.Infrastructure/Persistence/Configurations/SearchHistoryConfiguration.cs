using CarCheck.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarCheck.Infrastructure.Persistence.Configurations;

public class SearchHistoryConfiguration : IEntityTypeConfiguration<SearchHistory>
{
    public void Configure(EntityTypeBuilder<SearchHistory> builder)
    {
        builder.ToTable("search_history");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasColumnName("id");

        builder.Property(s => s.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(s => s.CarId)
            .HasColumnName("car_id")
            .IsRequired();

        builder.Property(s => s.SearchedAt)
            .HasColumnName("searched_at")
            .HasDefaultValueSql("NOW()");

        builder.HasIndex(s => s.UserId);
        builder.HasIndex(s => s.SearchedAt);
    }
}
