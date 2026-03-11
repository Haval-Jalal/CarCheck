using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarCheck.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailVerifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "email_verifications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    token = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    used = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_email_verifications", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_email_verifications_token",
                table: "email_verifications",
                column: "token");

            migrationBuilder.CreateIndex(
                name: "IX_email_verifications_user_id",
                table: "email_verifications",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "email_verifications");
        }
    }
}
