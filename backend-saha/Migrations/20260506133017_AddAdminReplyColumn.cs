using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend_saha.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminReplyColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminReply",
                table: "Prescriptions",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminReply",
                table: "Prescriptions");
        }
    }
}
