using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_saha.Data;
using backend_saha.Models;
using System.Linq;
using System.Threading.Tasks;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Collections.Generic;
using System;

namespace backend_saha.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConsultationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        
        private readonly string _geminiApiKey = "AIzaSyCM2D_0qzDdKYV7c7zYogxiwwNEhl1HkIY"; 

        public ConsultationController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =======================================================
        // 1. API AI TƯ VẤN (GEMINI 2.5)
        // =======================================================
        [HttpPost("recommend")]
        public async Task<IActionResult> RecommendProducts([FromBody] SurveyRequest request)
        {
            try
            {
                var allDbProducts = await _context.Products
                    .Where(p => p.Uses != null && p.Uses != "")
                    .ToListAsync();

                if (!allDbProducts.Any())
                {
                    return BadRequest(new { message = "Kho thuốc trên Supabase đang trống, sếp phải thêm dữ liệu thật vào nhé!" });
                }

                var productCatalog = string.Join("\n", allDbProducts.Select(p => $"- ID: {p.Id} | Tên: {p.Name} | Công dụng: {p.Uses}"));

                string prompt = $@"
Bạn là Dược sĩ chuyên gia của nhà thuốc SaHa.
Bệnh nhân: {request.FullName}, {request.Age} tuổi.
Triệu chứng bệnh: {request.MainIssue}

Dưới đây là danh sách các sản phẩm đang có trong kho:
{productCatalog}

Nhiệm vụ của bạn:
1. Đưa ra 1 lời khuyên y tế ngắn gọn (khoảng 2 câu) an ủi và hướng dẫn bệnh nhân.
2. Chọn ra TỐI ĐA 3 ID sản phẩm phù hợp nhất với bệnh từ danh sách trên (nếu không có thuốc nào liên quan thì để mảng rỗng).
Yêu cầu BẮT BUỘC: CHỈ trả về đúng định dạng JSON như sau, tuyệt đối KHÔNG có markdown (```json), KHÔNG giải thích thêm lời nào khác:
{{
  ""advice"": ""lời khuyên y tế"",
  ""productIds"": [""id1"", ""id2""]
}}";

                using var httpClient = new HttpClient();
                var requestBody = new { contents = new[] { new { parts = new[] { new { text = prompt } } } } };
                var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
                
                // VŨ KHÍ HẠNG NẶNG ĐÃ LẮP ĐÚNG TÊN BÁC SĨ GEMINI-2.5-FLASH
                var uriBuilder = new UriBuilder("https", "generativelanguage.googleapis.com");
                uriBuilder.Path = "/v1beta/models/gemini-2.5-flash:generateContent";
                uriBuilder.Query = "key=" + _geminiApiKey.Trim();

                var response = await httpClient.PostAsync(uriBuilder.Uri, content);
                var responseString = await response.Content.ReadAsStringAsync();

                Console.WriteLine("\n========= KẾT QUẢ TỪ GOOGLE =========");
                Console.WriteLine(responseString);
                Console.WriteLine("=====================================\n");

                if (!response.IsSuccessStatusCode || !responseString.Contains("candidates"))
                {
                    return StatusCode(500, new { message = "LỖI TỪ GOOGLE: " + responseString });
                }

                using var jsonDocument = JsonDocument.Parse(responseString);
                var aiText = jsonDocument.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text").GetString();

                aiText = aiText?.Replace("```json", "").Replace("```", "").Trim() ?? "{}";
                
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var aiResult = JsonSerializer.Deserialize<AiResponse>(aiText, options);

                var recommendedProducts = allDbProducts
                    .Where(p => aiResult != null && aiResult.ProductIds.Contains(p.Id.ToString()))
                    .ToList();

                return Ok(new
                {
                    patientName = request.FullName,
                    diagnosisAdvice = aiResult?.Advice ?? "Vui lòng đến bệnh viện kiểm tra chi tiết.",
                    products = recommendedProducts
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi Code C#: " + ex.Message });
            }
        }

        // =======================================================
        // 2. API NẠP DATA SIÊU TỐC
        // =======================================================
        [HttpGet("buff-data-le")]
        public async Task<IActionResult> BuffDataLe()
        {
            var allProducts = await _context.Products.ToListAsync();

            if (allProducts.Count == 0)
            {
                return Ok("Kho đang rỗng hoàn toàn! Sếp thêm vài tên sản phẩm vào Supabase đi rồi em mới buff công dụng được.");
            }

            var thuocXin = new List<(string uses, string ingredients)>
            {
                ("Hỗ trợ giảm đau đầu, chóng mặt, buồn nôn, tăng cường tuần hoàn máu não.", "Ginkgo Biloba, Đinh lăng, Vitamin B6"),
                ("Giúp dễ ngủ, ngủ sâu giấc, giảm căng thẳng, stress cực kỳ hiệu quả.", "Melatonin, Tâm sen, Lạc tiên, GABA"),
                ("Bổ sung canxi, hỗ trợ giảm đau nhức xương khớp, tê bì chân tay.", "Canxi Nano, Vitamin D3, MK7, Glucosamine"),
                ("Hỗ trợ tiêu hóa, giảm trào ngược dạ dày, đầy hơi, khó tiêu.", "Men vi sinh 10 tỷ bào tử lợi khuẩn, Nghệ Nano Curcumin"),
                ("Tăng cường sức đề kháng, bổ sung vitamin tổng hợp, phục hồi thể lực.", "Vitamin C, Kẽm, Hồng sâm, Yến sào"),
                ("Hỗ trợ bảo vệ gan, giải độc gan, hạ men gan do uống nhiều rượu bia.", "Cà gai leo, Silymarin, Mật nhân"),
                ("Giúp sáng mắt, giảm nhức mỏi mắt, chống ánh sáng xanh cho người dùng máy tính nhiều.", "Omega 3, Lutein, Zeaxanthin, Vitamin A")
            };

            var random = new Random();
            int count = 0;

            foreach (var p in allProducts)
            {
                if (string.IsNullOrEmpty(p.Uses) || string.IsNullOrEmpty(p.Ingredients))
                {
                    var thuoc = thuocXin[random.Next(thuocXin.Count)];
                    
                    p.Uses = thuoc.uses;
                    var ingredientArray = thuoc.ingredients.Split(',').Select(i => i.Trim()).ToArray();
                    p.Ingredients = JsonSerializer.Serialize(ingredientArray);
                    
                    count++;
                }
            }

            await _context.SaveChangesAsync();
            return Ok($"Đã xả trạm! Buff thành công dữ liệu siêu xịn cho {count} sản phẩm. Sếp test AI tẹt ga đi!");
        }

        // =======================================================
        // 3. API KIỂM TRA XEM GOOGLE CHO PHÉP DÙNG MODEL NÀO
        // =======================================================
        [HttpGet("check-models")]
        public async Task<IActionResult> CheckModels()
        {
            try
            {
                using var httpClient = new HttpClient();
                
                var uriBuilder = new UriBuilder("https", "generativelanguage.googleapis.com");
                uriBuilder.Path = "/v1beta/models";
                uriBuilder.Query = "key=" + _geminiApiKey.Trim();

                var response = await httpClient.GetAsync(uriBuilder.Uri);
                var data = await response.Content.ReadAsStringAsync();
                
                return Content(data, "application/json");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Lỗi khi gọi Google: " + ex.Message);
            }
        }
    }

    public class SurveyRequest
    {
        public string FullName { get; set; } = string.Empty;
        public int Age { get; set; }
        public string MainIssue { get; set; } = string.Empty;
    }

    public class AiResponse
    {
        public string Advice { get; set; } = string.Empty;
        public List<string> ProductIds { get; set; } = new List<string>();
    }
}