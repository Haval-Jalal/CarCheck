using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarCheck.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SecurityHardening2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_password_resets_token",
                table: "password_resets");

            migrationBuilder.DropColumn(
                name: "token",
                table: "password_resets");

            migrationBuilder.AddColumn<string>(
                name: "ip_address",
                table: "security_events",
                type: "character varying(45)",
                maxLength: 45,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "token_hash",
                table: "password_resets",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_password_resets_token_hash",
                table: "password_resets",
                column: "token_hash",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_password_resets_token_hash",
                table: "password_resets");

            migrationBuilder.DropColumn(
                name: "ip_address",
                table: "security_events");

            migrationBuilder.DropColumn(
                name: "token_hash",
                table: "password_resets");

            migrationBuilder.AddColumn<string>(
                name: "token",
                table: "password_resets",
                type: "character varying(512)",
                maxLength: 512,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_password_resets_token",
                table: "password_resets",
                column: "token");
        }
    }
}
