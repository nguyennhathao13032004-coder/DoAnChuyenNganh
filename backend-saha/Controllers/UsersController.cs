using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_saha.Data;
using System;
using System.Threading.Tasks;

namespace backend_saha.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _context.Users.ToListAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi: " + ex.Message });
            }
        }

        // =========================================================
        // API SỬA THÔNG TIN KHÁCH HÀNG (Đã fix dùng EF Core)
        // =========================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UserUpdateDto request)
        {
            try
            {
                // Dùng FindAsync để C# tự động tìm trong Database
                var user = await _context.Users.FindAsync(id);
                
                if (user == null)
                {
                    return NotFound(new { message = "Không tìm thấy khách hàng này trong hệ thống!" });
                }

                // Cập nhật thông tin mới (CHỈ LƯU EMAIL VÀ USERNAME VÌ BẢNG CỦA SẾP KHÔNG CÓ CỘT HỌ TÊN)
                user.Email = request.Email;
                user.Username = request.Username;

                // C# tự động lưu lại mà không cần viết câu lệnh SQL
                await _context.SaveChangesAsync();
                
                return Ok(new { message = "Cập nhật khách hàng thành công!" });
            }
            catch (Exception ex)
            {
                // Trả về lỗi chi tiết nếu có
                return StatusCode(500, new { message = "Lỗi Database: " + (ex.InnerException?.Message ?? ex.Message) });
            }
        }

        // API này khách hàng sẽ gọi để lấy lịch của riêng họ
[HttpGet("api/appointments/my-appointments")]
public async Task<IActionResult> GetMyAppointments([FromQuery] string patientName)
{
    try
    {
        // Lấy lịch hẹn dựa theo tên khách hàng (hoặc UserId nếu bạn có dùng ID)
        var myApts = await _context.Appointments
            .Where(a => a.PatientName == patientName)
            .OrderByDescending(a => a.AppointmentDate)
            .ToListAsync();
            
        return Ok(myApts);
    }
    catch (Exception ex) { return StatusCode(500, ex.Message); }
}

        // =========================================================
        // API XÓA KHÁCH HÀNG (Đã fix dùng EF Core)
        // =========================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                
                if (user == null)
                {
                    return NotFound(new { message = "Không tìm thấy khách hàng này!" });
                }

                // Xóa và lưu lại bằng C# tự động
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                
                return Ok(new { message = "Đã xóa khách hàng khỏi hệ thống!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi Database: " + (ex.InnerException?.Message ?? ex.Message) });
            }
        }
    }

    public class UserUpdateDto
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Username { get; set; }
    }
    
}