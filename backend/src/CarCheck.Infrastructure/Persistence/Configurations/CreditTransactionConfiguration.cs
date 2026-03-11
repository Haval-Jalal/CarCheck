using CarCheck.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CarCheck.Infrastructure.Persistence.Configurations;

public class CreditTransactionConfiguration : IEntityTypeConfiguration<CreditTransaction>
{
    public void Configure(EntityTypeBuilder<CreditTransaction> builder)
    {
        builder.ToTable("credit_transactions");

        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).HasColumnName("id");

        builder.Property(t => t.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(t => t.Type)
            .HasColumnName("type")
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(t => t.Credits)
            .HasColumnName("credits");

        builder.Property(t => t.AmountOre)
            .HasColumnName("amount_ore")
            .IsRequired();

        builder.Property(t => t.Description)
            .HasColumnName("description")
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(t => t.ExternalPaymentId)
            .HasColumnName("external_payment_id")
            .HasMaxLength(256);

        builder.Property(t => t.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.HasIndex(t => t.UserId);
        builder.HasIndex(t => t.ExternalPaymentId)
            .IsUnique()
            .HasFilter("external_payment_id IS NOT NULL");
    }
}
