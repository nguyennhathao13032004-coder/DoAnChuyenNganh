using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_saha.Data;
using backend_saha.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace backend_saha.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PrescriptionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public PrescriptionsController(ApplicationDbContext context) { _context = context; }

        // 1. Admin lấy tất cả đơn thuốc khách gửi
        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _context.Prescriptions.OrderByDescending(p => p.CreatedAt).ToListAsync());

        // 2. KHÁCH HÀNG GỬI ĐƠN THUỐC MỚI 
        [HttpPost]
        public async Task<IActionResult> CreatePrescription([FromBody] Prescription prescription)
        {
            try
            {
                // Gắn cứng dữ liệu trước khi lưu
                prescription.Id = Guid.NewGuid();
                prescription.CreatedAt = DateTime.UtcNow; // Xài UTC cho PostgreSQL
                prescription.Status = "Pending";

                _context.Prescriptions.Add(prescription);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Gửi đơn thuốc thành công!", data = prescription });
            }
            catch (Exception ex)
            {
                Console.WriteLine("=====================================");
                Console.WriteLine("🛑 LỖI LƯU ĐƠN THUỐC: " + ex.Message);
                if (ex.InnerException != null)
                {
                    Console.WriteLine("🛑 NGUYÊN NHÂN GỐC: " + ex.InnerException.Message);
                }
                Console.WriteLine("=====================================");

                return StatusCode(500, new { message = "Lỗi Backend: " + ex.Message });
            }
        }

        // 3. Cập nhật trạng thái (Dùng cho Admin)
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] string status)
        {
            var p = await _context.Prescriptions.FindAsync(id);
            if (p == null) return NotFound(new { message = "Không tìm thấy đơn thuốc" });
            
            p.Status = status;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật thành công" });
        }

        // 4. Admin gửi phản hồi (Reply)
        [HttpPut("{id}/reply")]
        public async Task<IActionResult> ReplyPrescription(Guid id, [FromBody] ReplyDto dto)
        {
            var p = await _context.Prescriptions.FindAsync(id);
            if (p == null) return NotFound(new { message = "Không tìm thấy đơn thuốc" });
            
            p.AdminReply = dto.Reply; // Lưu lời khuyên
            p.Status = "Processed";   // Tự động chuyển trạng thái thành Đã xử lý
    
            await _context.SaveChangesAsync();
            return Ok(new { message = "Phản hồi thành công!" });
        }

        // 5. BỔ SUNG: Khách hàng xem lịch sử đơn của chính mình
        [HttpGet("customer/{customerName}")]
        public async Task<IActionResult> GetCustomerPrescriptions(string customerName)
        {
            var list = await _context.Prescriptions
                .Where(p => p.CustomerName == customerName)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
            return Ok(list);
        }
    }

    // Class chứa dữ liệu text phản hồi của Admin
    public class ReplyDto {
        public string Reply { get; set; }
    }
}