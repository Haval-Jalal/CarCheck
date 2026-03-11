using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarCheck.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCreditTransactions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "credit_transactions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    credits = table.Column<int>(type: "integer", nullable: true),
                    amount_ore = table.Column<int>(type: "integer", nullable: false),
                    description = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    external_payment_id = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_credit_transactions", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_credit_transactions_user_id",
                table: "credit_transactions",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_credit_transactions_external_payment_id",
                table: "credit_transactions",
                column: "external_payment_id",
                unique: true,
                filter: "external_payment_id IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "credit_transactions");
        }
    }
}
