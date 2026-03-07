using CarCheck.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarCheck.Infrastructure.Persistence.Configurations;

public class AnalysisResultConfiguration : IEntityTypeConfiguration<AnalysisResult>
{
    public void Configure(EntityTypeBuilder<AnalysisResult> builder)
    {
        builder.ToTable("analysis_results");

        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).HasColumnName("id");

        builder.Property(a => a.CarId)
            .HasColumnName("car_id")
            .IsRequired();

        builder.Property(a => a.Score)
            .HasColumnName("score")
            .HasPrecision(5, 2)
            .IsRequired();

        builder.Property(a => a.Recommendation)
            .HasColumnName("recommendation")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(a => a.CreatedAt)
            .HasColumnName("created_at")
            .HasDefaultValueSql("NOW()");

        builder.HasIndex(a => a.CarId);
    }
}
