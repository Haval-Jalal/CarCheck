using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarCheck.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddUserTourCompleted : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "tour_completed",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "tour_completed",
                table: "users");
        }
    }
}
