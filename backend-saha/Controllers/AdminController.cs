using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_saha.Data;
using backend_saha.Models; // Đảm bảo có dòng này để xài Model Product
using System;
using System.Threading.Tasks;
using System.Linq;
using System.Text.Json;
using System.Text;
using System.Net.Http;
using System.Collections.Generic; // Bổ sung dòng này để dùng List<> cho Mắt Thần

namespace backend_saha.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // 1. API GIÁM SÁT CHAT LOGS
        // ==========================================
        [HttpGet("chat-logs")]
        public async Task<IActionResult> GetChatLogs()
        {
            var logs = await _context.AiChatLogs
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();
            return Ok(logs);
        }
        
        // ==========================================
        // 2. API TẠO BÀI VIẾT BẰNG AI (BLOG) - BẢN ỔN ĐỊNH NHẤT
        // ==========================================
        public class AiBlogRequest { public string Topic { get; set; } }

        [HttpPost("tao-bai-viet")] // Đổi cái đuôi cho nó mới toanh
        public async Task<IActionResult> GenerateBlogByAI([FromBody] AiBlogRequest req)
        {
            if (string.IsNullOrEmpty(req.Topic)) return BadRequest(new { message = "Vui lòng nhập chủ đề!" });

            try
            {
                // Dùng prompt chuẩn ép về JSON
                string prompt = $@"Bạn là Bác sĩ và chuyên gia viết lách. Hãy viết bài về: '{req.Topic}'. 
                TRẢ VỀ JSON CHÍNH XÁC, KHÔNG GIẢI THÍCH, KHÔNG MARKDOWN:
                {{
                    ""title"": ""Tiêu đề bài viết hấp dẫn"",
                    ""description"": ""Mô tả ngắn khoảng 150 chữ"",
                    ""content"": ""Nội dung chi tiết dùng các thẻ HTML h2, h3, p, strong, ul, li""
                }}";

                var requestBody = new { contents = new[] { new { parts = new[] { new { text = prompt } } } } };
                
                string apiKey = "AIzaSyCM2D_0qzDdKYV7c7zYogxiwwNEhl1HkIY"; 
                // VÀ ĐỔI NÓ LẠI THÀNH CHUẨN 2.5 CỦA BẠN:
                var uri = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";

                using var client = new HttpClient();
                var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

                var response = await client.PostAsync(uri, content);
                var responseString = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode, new { message = "Lỗi API Gemini", detail = responseString });
                }

                using var document = JsonDocument.Parse(responseString);
                var aiRawJson = document.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString()?? "";

                // Cắt gọt lấy đúng phần JSON an toàn tuyệt đối
                int first = aiRawJson.IndexOf('{');
                int last = aiRawJson.LastIndexOf('}');
                if (first != -1 && last != -1) 
                {
                    aiRawJson = aiRawJson.Substring(first, last - first + 1);
                }

                return Ok(aiRawJson);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống C#", detail = ex.Message });
            }
        }
        [HttpGet("test-code")]
        public IActionResult TestCode() { 
            return Ok("CHÚC MỪNG! C# ĐÃ NHẬN CODE MỚI!"); 
        }
        // LẤY DANH SÁCH BLOG CHO TRANG QUẢN LÝ
[HttpGet("blogs")]
public async Task<IActionResult> GetAllBlogs()
{
    try
    {
        // Gọi thẳng vào bảng Blogs, lấy tất cả bài viết, xếp bài mới nhất lên đầu
        var blogs = await _context.Blogs
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        return Ok(blogs);
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "Lỗi khi lấy danh sách Blog", error = ex.Message });
    }
}
       [HttpGet("ai-insights")]
public async Task<IActionResult> GetAiInsights()
{
    try
    {
        Console.WriteLine(">>> 1. BẮT ĐẦU LẤY DỮ LIỆU TỪ DATABASE...");
        // ⚠️ NẾU BỊ SẬP Ở ĐÂY: Kiểm tra lại xem _context.AiChatLogs và _context.Orders có đúng tên trong ApplicationDbContext chưa!
        var chats = await _context.AiChatLogs.OrderByDescending(c => c.CreatedAt).Take(20).ToListAsync();
        var orders = await _context.Orders.OrderByDescending(o => o.CreatedAt).Take(10).ToListAsync();
        
        Console.WriteLine($">>> 2. LẤY THÀNH CÔNG: {chats.Count} chat và {orders.Count} đơn hàng.");

        string chatLog = chats.Any() ? string.Join(", ", chats.Select(c => c.UserMessage)) : "Không có chat";
        string orderLog = orders.Any() ? string.Join(", ", orders.Select(o => o.TotalAmount + "đ")) : "Không có đơn";

        string prompt = $@"Dữ liệu SaHa: Khách hỏi: {chatLog}. Đơn hàng: {orderLog}. 
        Hãy phân tích và trả về JSON chuẩn: {{ ""trending"": ""..."",""warning"": ""..."",""blogSuggest"": ""..."" }} 
        Lưu ý: Chỉ trả về JSON, không thêm văn bản khác.";

        Console.WriteLine(">>> 3. ĐANG GỬI DỮ LIỆU LÊN GEMINI AI...");
        string apiKey = "AIzaSyCM2D_0qzDdKYV7c7zYogxiwwNEhl1HkIY";
        var requestBody = new { contents = new[] { new { parts = new[] { new { text = prompt } } } } };
        var uri = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";

        using var client = new HttpClient();
        var content = new StringContent(System.Text.Json.JsonSerializer.Serialize(requestBody), System.Text.Encoding.UTF8, "application/json");
        var response = await client.PostAsync(uri, content);
        var responseString = await response.Content.ReadAsStringAsync();

        Console.WriteLine(">>> 4. GEMINI TRẢ VỀ: " + responseString);

        if (!response.IsSuccessStatusCode)
        {
            return StatusCode(500, new { error = "Lỗi từ Gemini API", details = responseString });
        }

        using var document = System.Text.Json.JsonDocument.Parse(responseString);
        var aiRawText = document.RootElement.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();

        int first = aiRawText.IndexOf('{');
        int last = aiRawText.LastIndexOf('}');
        if (first != -1 && last != -1) aiRawText = aiRawText.Substring(first, last - first + 1);

        Console.WriteLine(">>> 5. HOÀN THÀNH JSON: " + aiRawText);
        return Ok(aiRawText);
    }
    catch (Exception ex) 
    { 
        Console.WriteLine("❌❌❌ LỖI SẬP SERVER: " + ex.Message);
        return StatusCode(500, new { error = ex.Message }); 
    }
}
        // 1. LẤY DANH SÁCH LỊCH HẸN
[HttpGet("appointments")]
public async Task<IActionResult> GetAppointments()
{
    try
    {
        // Đã sửa lại thành AppointmentDate chuẩn xác!
        var appointments = await _context.Appointments
            .OrderByDescending(a => a.AppointmentDate) 
            .ToListAsync();
        return Ok(appointments);
    }
    catch (Exception ex) { return StatusCode(500, ex.Message); }
}

// 2. CẬP NHẬT TRẠNG THÁI (DUYỆT/TỪ CHỐI)
// Tạo một class nhỏ để hứng dữ liệu từ React gửi lên
public class UpdateAptDto
{
    public string Status { get; set; } = string.Empty;
    public string MeetLink { get; set; } = string.Empty;
}

// Hàm cập nhật trạng thái mới
[HttpPut("appointments/{id}/status")]
public async Task<IActionResult> UpdateAppointmentStatus(int id, [FromBody] UpdateAptDto data)
{
    try
    {
        var apt = await _context.Appointments.FindAsync(id);
        if (apt == null) return NotFound();

        apt.Status = data.Status; 
        
        // Nếu Admin có gửi kèm link thì lưu link vào DB
        if (!string.IsNullOrEmpty(data.MeetLink))
        {
            apt.MeetLink = data.MeetLink;
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Đã chốt lịch & Gửi link cho khách!" });
    }
    catch (Exception ex) { return StatusCode(500, ex.Message); }
}

        // 🔥 API LẤY LỊCH HẸN CHO KHÁCH HÀNG (Đi ké AdminController cho chắc cú)
[HttpGet("my-appointments")]
public async Task<IActionResult> GetMyAppointments([FromQuery] string patientName)
{
    try
    {
        var myApts = await _context.Appointments
            .Where(a => a.PatientName == patientName)
            .OrderByDescending(a => a.AppointmentDate)
            .ToListAsync();
            
        return Ok(myApts);
    }
    catch (Exception ex) { return StatusCode(500, ex.Message); }
}
        // ==========================================
        // 3. API LƯU LỊCH SỬ CHAT TỪ FRONTEND
        // ==========================================
        public class ChatLogRequest 
        { 
            public string? UserEmail { get; set; } 
            public string? UserMessage { get; set; } 
            public string? AiResponse { get; set; } 
        }

        [HttpPost("save-chat-log")]
        public async Task<IActionResult> SaveChatLog([FromBody] ChatLogRequest req)
        {
            try
            {
                var log = new AiChatLog 
                {
                    UserEmail = string.IsNullOrEmpty(req.UserEmail) ? "Guest" : req.UserEmail,
                    UserMessage = req.UserMessage,
                    AiResponse = req.AiResponse,
                    CreatedAt = DateTime.UtcNow
                };
                
                _context.AiChatLogs.Add(log);
                await _context.SaveChangesAsync();
                
                return Ok(new { message = "Lưu lịch sử thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
        
    }
}