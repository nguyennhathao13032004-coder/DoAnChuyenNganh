using Microsoft.AspNetCore.Mvc;
using backend_saha.Data;
using backend_saha.Models;
using System;
using System.Threading.Tasks;

namespace backend_saha.Controllers
{
    [Route("api/appointments")] 
    [ApiController]
    public class AppointmentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AppointmentController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("book")]
        public async Task<IActionResult> BookAppointment([FromBody] Appointment appointment)
        {
            // Ép giờ khách đặt về UTC để PostgreSQL chịu lưu
            appointment.AppointmentDate = appointment.AppointmentDate.ToUniversalTime();
            appointment.CreatedAt = DateTime.UtcNow;
            appointment.Status = "Pending"; // Mặc định là chờ Dược sĩ duyệt

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tuyệt vời! Đã gửi yêu cầu đặt lịch. Dược sĩ sẽ sớm xác nhận và gửi link Google Meet cho bạn." });
        }
    }
}