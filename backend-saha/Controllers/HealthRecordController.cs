using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_saha.Data;
using backend_saha.Models;
using System.Linq;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;

namespace backend_saha.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HealthRecordController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public HealthRecordController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. API: KHÁCH HÀNG NHẬP CHỈ SỐ MỚI
        [HttpPost("add")]
        public async Task<IActionResult> AddRecord([FromBody] HealthRecord record)
        {
            // Tự động gán giờ hiện tại
           record.RecordDate = DateTime.UtcNow;
            
            _context.HealthRecords.Add(record);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Lưu hồ sơ sức khỏe thành công!" });
        }

        // 2. API: LẤY LỊCH SỬ ĐỂ VẼ BIỂU ĐỒ (Dành cho React)
        [HttpGet("history/{patientName}")]
        public async Task<IActionResult> GetHistory(string patientName)
        {
            var records = await _context.HealthRecords
                .Where(r => r.PatientName == patientName)
                .OrderBy(r => r.RecordDate) // Sắp xếp theo ngày cũ -> mới để vẽ biểu đồ cho chuẩn
                .ToListAsync();

            return Ok(records);
        }

        // 3. API: AI/LOGIC PHÂN TÍCH - CÓ CẦN GẶP BÁC SĨ KHÔNG?
        [HttpGet("check-warning/{patientName}")]
        public async Task<IActionResult> CheckWarning(string patientName)
        {
            // Lấy 2 bản ghi mới nhất của bệnh nhân này
            var recentRecords = await _context.HealthRecords
                .Where(r => r.PatientName == patientName)
                .OrderByDescending(r => r.RecordDate)
                .Take(2)
                .ToListAsync();

            // Nếu chưa có đủ 2 tuần/2 lần nhập thì chưa cần cảnh báo
            if (recentRecords.Count < 2)
            {
                return Ok(new { needsConsultation = false, message = "Chưa đủ dữ liệu để phân tích." });
            }

            var recordMoiNhat = recentRecords[0]; // Tuần này
            var recordTuanTruoc = recentRecords[1]; // Tuần trước

            // LOGIC CẢNH BÁO: Mức độ đau không giảm hoặc tăng lên, HOẶC ngủ ít hơn 4 tiếng
            bool isPainGettingWorse = recordMoiNhat.PainLevel >= recordTuanTruoc.PainLevel && recordMoiNhat.PainLevel >= 5;
            bool isSleepingBadly = recordMoiNhat.SleepHours < 4;

            if (isPainGettingWorse || isSleepingBadly)
            {
                return Ok(new 
                { 
                    needsConsultation = true, 
                    message = "Chỉ số của bạn không có dấu hiệu cải thiện. Đã đến lúc đặt lịch gọi trực tiếp với Dược sĩ!" 
                });
            }

            return Ok(new { needsConsultation = false, message = "Sức khỏe đang cải thiện tốt, hãy tiếp tục duy trì nhé!" });
        }
    }
}