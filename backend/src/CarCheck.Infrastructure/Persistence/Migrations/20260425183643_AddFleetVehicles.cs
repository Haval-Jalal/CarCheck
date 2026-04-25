using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarCheck.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddFleetVehicles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "fleet_vehicles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    registration_number = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    nickname = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    added_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    added_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_fleet_vehicles", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_fleet_vehicles_company_id",
                table: "fleet_vehicles",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "ix_fleet_vehicles_company_reg",
                table: "fleet_vehicles",
                columns: new[] { "company_id", "registration_number" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "fleet_vehicles");
        }
    }
}
