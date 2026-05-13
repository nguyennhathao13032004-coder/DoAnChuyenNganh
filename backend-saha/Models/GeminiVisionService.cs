using System.Text;
using System.Text.Json;
using backend_saha.Models;

namespace backend_saha.Models
{
    public class GeminiVisionService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey = "AIzaSyCM2D_0qzDdKYV7c7zYogxiwwNEhl1HkIY"; // Key của sếp

        public GeminiVisionService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<AiRecognizedProduct> RecognizeProductFromImage(string base64Image)
        {
            try
            {
                // 1. LỆNH CHO AI CHUYÊN GIA DƯỢC
                string prompt = @"Bạn là một chuyên gia về nhãn thuốc và dược phẩm. Hãy nhìn vào hình ảnh vỏ hộp hoặc nhãn thuốc này.
                Nhiệm vụ: Trích xuất các thông tin y tế chính xác. CHỈ TRẢ VỀ JSON SAU, KHÔNG GIẢI THÍCH, KHÔNG MARKDOWN:
                {
                    ""productName"": ""Tên thương mại của thuốc"",
                    ""mainIngredients"": [""Thành phần 1"", ""Thành phần 2""],
                    ""medicalPurpose"": ""Công dụng chính hoặc loại bệnh thuốc điều trị (Diagnosis)""
                }";

                // 2. GÓI DỮ LIỆU (TEXT + ẢNH) CHO GEMINI 2.5
                var requestBody = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new object[]
                            {
                                new { text = prompt },
                                new { inline_data = new { mime_type = "image/jpeg", data = base64Image } } 
                            }
                        }
                    }
                };

                // 3. 🔥 DÙNG ĐÚNG MÔ HÌNH GEMINI 2.5 FLASH SIÊU NHANH
                var uri = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={_apiKey}";
                
                var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync(uri, content);
                var responseString = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode) throw new Exception($"Lỗi Google API 2.5: {responseString}");

                // 4. BÓC TÁCH KẾT QUẢ JSON
                using var document = JsonDocument.Parse(responseString);
                var root = document.RootElement;
                var aiText = root.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();

                // Dọn dẹp rác markdown nếu có
                int firstBrace = aiText.IndexOf('{');
                int lastBrace = aiText.LastIndexOf('}');
                if (firstBrace != -1 && lastBrace != -1) aiText = aiText.Substring(firstBrace, lastBrace - firstBrace + 1);

                return JsonSerializer.Deserialize<AiRecognizedProduct>(aiText, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
            catch (Exception ex)
            {
                // Bắt lỗi đỏ ra Console để sếp dễ soi
                Console.Error.WriteLine($"Lỗi Mắt Thần AI (2.5): {ex.Message}");
                return null;
            }
        }
    }
}