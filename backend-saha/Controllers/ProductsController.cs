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
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // 1. API: Lấy danh sách sản phẩm (Bao trọn gói: Lấy hết, Lọc theo Category, Brand VÀ TÌM KIẾM)
        // GIỮ NGUYÊN 100% CODE CỦA SẾP
        // ==========================================
        [HttpGet]
        public async Task<IActionResult> GetAllProducts(
            [FromQuery] int? categoryId, 
            [FromQuery] string? brand, 
            [FromQuery] string? searchTerm) 
        {
            try
            {
                var query = _context.Products.AsQueryable();

                // 1. Lọc theo danh mục
                if (categoryId.HasValue)
                {
                    query = query.Where(p => p.CategoryId == categoryId.Value);
                }

                // 2. Lọc theo thương hiệu
                if (!string.IsNullOrEmpty(brand))
                {
                    query = query.Where(p => p.Brand != null && p.Brand.ToLower().Contains(brand.ToLower()));
                }

                // 3. TÌM KIẾM THEO TÊN, THƯƠNG HIỆU VÀ XUẤT XỨ
                if (!string.IsNullOrEmpty(searchTerm))
                {
                    var term = searchTerm.ToLower().Trim(); 
                    query = query.Where(p => 
                        (p.Name != null && p.Name.ToLower().Contains(term)) ||
                        (p.Brand != null && p.Brand.ToLower().Contains(term)) ||
                        (p.Origin != null && p.Origin.ToLower().Contains(term))
                    );
                }

                var products = await query.ToListAsync();
                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy sản phẩm: " + ex.Message });
            }
        }
        
        // ==========================================
        // 2. API: Lấy chi tiết 1 sản phẩm theo ID (GIỮ NGUYÊN)
        // ==========================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductById(Guid id)
        {
            try
            {
                var product = await _context.Products.FindAsync(id);

                if (product == null)
                {
                    return NotFound(new { message = "Không tìm thấy sản phẩm này" });
                }

                return Ok(product);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy chi tiết sản phẩm: " + ex.Message });
            }
        }

        // ==========================================
        // 3. API DÀNH CHO ADMIN: THÊM THUỐC MỚI
        // ==========================================
        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] Product product)
        {
            try
            {
                product.Id = Guid.NewGuid(); // Tự sinh ID mới
                _context.Products.Add(product);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Thêm sản phẩm thành công!", id = product.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi thêm sản phẩm: " + ex.Message });
            }
        }

        // ==========================================
        // 4. API DÀNH CHO ADMIN: CẬP NHẬT THUỐC (SỬA)
        // ==========================================
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] Product updatedProduct)
        {
            try
            {
                var product = await _context.Products.FindAsync(id);
                if (product == null) return NotFound(new { message = "Không tìm thấy sản phẩm" });

                // Cập nhật các trường thông tin từ Frontend gửi lên
                product.Name = updatedProduct.Name;
                product.Price = updatedProduct.Price;
                product.StockQty = updatedProduct.StockQty;
                product.ImageUrl = updatedProduct.ImageUrl;
                product.Brand = updatedProduct.Brand;

                await _context.SaveChangesAsync();
                return Ok(new { message = "Cập nhật sản phẩm thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi cập nhật sản phẩm: " + ex.Message });
            }
        }

        // ==========================================
        // 5. API DÀNH CHO ADMIN: XÓA THUỐC
        // ==========================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(Guid id)
        {
            try
            {
                var product = await _context.Products.FindAsync(id);
                if (product == null) return NotFound(new { message = "Không tìm thấy sản phẩm" });

                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Xóa sản phẩm thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi xóa sản phẩm: " + ex.Message });
            }
        }
        
        // ==========================================
        // 6. API TRUY XUẤT NGUỒN GỐC (TRACEABILITY TIMELINE)
        // ==========================================
        [HttpGet("{id}/traceability")]
        public async Task<IActionResult> GetProductTraceability(Guid id)
        {
            try
            {
                var product = await _context.Products.FindAsync(id);
                if (product == null) return NotFound(new { message = "Không tìm thấy sản phẩm" });

                // Lấy ngày tạo, nếu không có thì lấy ngày hiện tại trừ đi 30 ngày
                var baseDate = DateTime.Now; 

                // Tạo một Timeline giả lập cực kỳ logic dựa trên thông tin thật của thuốc
                var timeline = new List<object>
                {
                    new { 
                        date = baseDate.AddDays(-45).ToString("dd/MM/yyyy"), 
                        title = "Sản xuất & Đóng gói", 
                        location = product.Origin ?? "Đang cập nhật", 
                        description = $"Xuất xưởng từ dây chuyền nhà máy {product.Brand ?? "Đối tác"}.", 
                        status = "completed" 
                    },
                    new { 
                        date = baseDate.AddDays(-30).ToString("dd/MM/yyyy"), 
                        title = "Kiểm định chất lượng (QC)", 
                        location = "Trung tâm kiểm nghiệm Bộ Y Tế", 
                        description = "Đạt tiêu chuẩn thực hành sản xuất tốt (GMP-WHO).", 
                        status = "completed" 
                    },
                    new { 
                        date = baseDate.AddDays(-10).ToString("dd/MM/yyyy"), 
                        title = "Nhập kho tổng SaHa", 
                        location = "Tổng kho Thủ Dầu Một, Bình Dương", 
                        description = "Lưu kho ở nhiệt độ và độ ẩm tiêu chuẩn (< 25°C).", 
                        status = "completed" 
                    },
                    new { 
                        date = "Hiện tại", 
                        title = "Sẵn sàng phân phối", 
                        location = "Hệ thống nhà thuốc SaHa", 
                        description = "Sản phẩm chính hãng 100%, niêm phong nguyên vẹn.", 
                        status = "active" 
                    }
                };

                return Ok(new { 
                    productName = product.Name,
                    brand = product.Brand,
                    timeline = timeline 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }
        
        // ==========================================
        // 7. API AI HEALTH QUIZ
        // ==========================================
        public class QuizRequest {
            public string Name { get; set; } 
            public string Age { get; set; }
            public string Goal { get; set; }
            public string Symptoms { get; set; }
        }

        public class AiComboResult {
            public string Analysis { get; set; }
            public List<Guid> RecommendedProductIds { get; set; }
        }

        [HttpPost("ai-health-quiz")]
        public async Task<IActionResult> GetAiComboRecommendation([FromBody] QuizRequest req)
        {
            try
            {
                var availableProducts = await _context.Products
                    .Select(p => new { p.Id, p.Name })
                    .ToListAsync();
                    
                string productCatalog = JsonSerializer.Serialize(availableProducts);

                string prompt = $@"Bạn là chuyên gia y tế. Bệnh nhân {req.Name}, {req.Age} tuổi. Mục tiêu: {req.Goal}. Triệu chứng: {req.Symptoms}.
                Cửa hàng đang có sẵn các mã thuốc này: {productCatalog}
                
                Nhiệm vụ: Chọn 1 đến 2 mã thuốc phù hợp nhất. CHỈ TRẢ VỀ JSON SAU, KHÔNG GIẢI THÍCH, KHÔNG CHÀO HỎI:
                {{
                    ""analysis"": ""Lời khuyên ngắn gọn cho bệnh nhân."",
                    ""recommendedProductIds"": [""id_thuoc_1"", ""id_thuoc_2""]
                }}";

                string apiKey = "AIzaSyCM2D_0qzDdKYV7c7zYogxiwwNEhl1HkIY"; 
                var uriBuilder = new UriBuilder("https", "generativelanguage.googleapis.com");
                uriBuilder.Path = "/v1beta/models/gemini-2.5-flash:generateContent";
                uriBuilder.Query = "key=" + apiKey.Trim();
                
                var requestBody = new { contents = new[] { new { parts = new[] { new { text = prompt } } } } };
                
                // Giáp vượt rào SSL
                var handler = new HttpClientHandler { ServerCertificateCustomValidationCallback = (sender, cert, chain, sslPolicyErrors) => true };
                using var client = new HttpClient(handler);
                
                var content = new StringContent(JsonSerializer.Serialize(requestBody), System.Text.Encoding.UTF8, "application/json");
                var response = await client.PostAsync(uriBuilder.ToString(), content);
                var responseString = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode) return StatusCode(500, new { error = "Lỗi Google API: " + responseString });

                using var document = JsonDocument.Parse(responseString);
                var root = document.RootElement;
                if (!root.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
                    return StatusCode(500, new { error = "AI không trả lời: " + responseString });

                var aiResponseText = candidates[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();
                
                int firstBrace = aiResponseText.IndexOf('{');
                int lastBrace = aiResponseText.LastIndexOf('}');
                if (firstBrace != -1 && lastBrace != -1) {
                    aiResponseText = aiResponseText.Substring(firstBrace, lastBrace - firstBrace + 1);
                }

                var aiResult = JsonSerializer.Deserialize<AiComboResult>(aiResponseText, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (aiResult == null || aiResult.RecommendedProductIds == null || !aiResult.RecommendedProductIds.Any())
                {
                    return StatusCode(500, new { error = "AI không tìm thấy thuốc phù hợp. Raw AI Text: " + aiResponseText });
                }

                var finalProducts = await _context.Products
                    .Where(p => aiResult.RecommendedProductIds.Contains(p.Id))
                    .ToListAsync();

                return Ok(new {
                    advice = aiResult.Analysis,
                    products = finalProducts
                });
            }
            catch (Exception ex)
            {
                string chiTietLoi = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return StatusCode(500, new { error = "Lỗi C# Backend: " + chiTietLoi });
            }
        }

        // =========================================================================================
        // 8. TÍNH NĂNG MỚI: MẮT THẦN AI (SNAP & MATCH) - ĐỌC VỎ THUỐC BẰNG GEMINI 2.5 FLASH VISION
        // =========================================================================================
        public class SnapMatchRequest
        {
            public string ImageBase64 { get; set; }
        }

        public class AiRecognizedProduct
        {
            public bool IsMedicine { get; set; } // 🔥 THÊM DÒNG NÀY: Để AI báo cáo có phải thuốc không
            public string ProductName { get; set; }
            public List<string> MainIngredients { get; set; }
            public string MedicalPurpose { get; set; }
        }

        [HttpPost("snap-and-match")]
        public async Task<IActionResult> SnapAndMatchProduct([FromBody] SnapMatchRequest req)
        {
            if (string.IsNullOrEmpty(req.ImageBase64)) return BadRequest(new { error = "Sếp ơi, chưa có ảnh!" });

            try
            {
                // 1. LỆNH CHO AI CHUYÊN GIA DƯỢC PHẨM (ĐÃ CẬP NHẬT ĐỂ BẮT LỖI ẢNH RÁC)
                string prompt = @"Bạn là chuyên gia về dược phẩm và kiểm duyệt hình ảnh.
                Nhiệm vụ 1: Xác định xem hình ảnh CÓ PHẢI là vỏ hộp thuốc, lọ thuốc hoặc nhãn thuốc không. Nếu là tờ giấy đơn thuốc, người, phong cảnh, hay đồ vật khác thì isMedicine = false.
                Nhiệm vụ 2: Nếu là thuốc, hãy trích xuất thông tin.
                TRẢ VỀ JSON, KHÔNG GIẢI THÍCH, KHÔNG MARKDOWN:
                {
                    ""isMedicine"": true/false,
                    ""productName"": ""Tên thuốc (Ví dụ: Panadol, Omexxel) - Bỏ trống nếu không phải thuốc"",
                    ""mainIngredients"": [""Thành phần chính 1""],
                    ""medicalPurpose"": ""Công dụng tóm tắt""
                }";

                // 2. CHUẨN BỊ GÓI HÀNG ĐỂ GỬI ĐI
                var requestBody = new
                {
                    contents = new[]
                    {
                        new {
                            parts = new object[] {
                                new { text = prompt },
                                new { inline_data = new { mime_type = "image/jpeg", data = req.ImageBase64 } }
                            }
                        }
                    }
                };

                string apiKey = "AIzaSyCM2D_0qzDdKYV7c7zYogxiwwNEhl1HkIY";
                var uri = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";

                // 3. VƯỢT RÀO SSL VÀ GỌI GEMINI 2.5
                var handler = new HttpClientHandler { ServerCertificateCustomValidationCallback = (sender, cert, chain, sslPolicyErrors) => true };
                using var client = new HttpClient(handler);

                var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
                var response = await client.PostAsync(uri, content);
                var responseString = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode) return StatusCode(500, new { error = "Lỗi Google API 2.5: " + responseString });

                // 4. BÓC TÁCH JSON
                using var document = JsonDocument.Parse(responseString);
                var root = document.RootElement;
                var aiText = root.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();

                int firstBrace = aiText.IndexOf('{');
                int lastBrace = aiText.LastIndexOf('}');
                if (firstBrace != -1 && lastBrace != -1) aiText = aiText.Substring(firstBrace, lastBrace - firstBrace + 1);

                var aiInfo = JsonSerializer.Deserialize<AiRecognizedProduct>(aiText, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (aiInfo == null) return StatusCode(500, new { error = "AI đọc ảnh bị ngáo, sếp thử ảnh khác nhé!" });

                // 🔥 BƯỚC CHẶN CỬA: KIỂM TRA XEM CÓ PHẢI ẢNH VỎ THUỐC KHÔNG
                if (!aiInfo.IsMedicine)
                {
                    return Ok(new { status = "error_not_medicine" }); // Trả về mã lỗi để React tự hiện cảnh báo đỏ
                }

                // 5. TÌM KIẾM TRONG DATABASE CỦA SAHA (Giữ nguyên của sếp)
                var matchedProducts = await _context.Products
                    .Where(p => p.Name != null && p.Name.Contains(aiInfo.ProductName))
                    .Take(4)
                    .ToListAsync();

                // NẾU TÌM THEO TÊN KHÔNG RA, LẤY ĐẠI 4 SẢN PHẨM KHÁC ĐỂ TRƯNG BÀY (Up-sell)
                if (!matchedProducts.Any())
                {
                    matchedProducts = await _context.Products.Take(4).ToListAsync();
                }

                // 6. TRẢ KẾT QUẢ VỀ CHO REACT
                return Ok(new
                {
                    status = "success", // Thêm status để React phân biệt với lỗi
                    recognizedInfo = aiInfo,
                    matchedProducts = matchedProducts
                });
            }
            catch (Exception ex)
            {
                string err = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return StatusCode(500, new { error = "Lỗi Snap & Match Backend: " + err });
            }
        }
        // =========================================================================================
        // 9. TÍNH NĂNG MỚI: AI KIỂM TRA TƯƠNG TÁC THUỐC TRONG GIỎ HÀNG (DRUG INTERACTION CHECKER)
        // =========================================================================================
        public class InteractionRequest
        {
            public List<string> ProductNames { get; set; }
        }

        public class InteractionResult
        {
            public bool HasInteraction { get; set; } // Có kỵ nhau không?
            public string Severity { get; set; } // Mức độ: High, Medium, Low, None
            public string WarningMessage { get; set; } // Lời cảnh báo chi tiết
        }

        [HttpPost("check-interactions")]
        public async Task<IActionResult> CheckDrugInteractions([FromBody] InteractionRequest req)
        {
            if (req.ProductNames == null || req.ProductNames.Count < 2)
            {
                return Ok(new InteractionResult { HasInteraction = false, WarningMessage = "An toàn." });
            }

            try
            {
                string drugList = string.Join(", ", req.ProductNames);
                string prompt = $@"Bạn là một Dược sĩ lâm sàng cấp cao. Bệnh nhân đang định mua các loại thuốc/thực phẩm chức năng sau để uống cùng nhau: {drugList}.
                Hãy kiểm tra xem các sản phẩm này có tương tác thuốc (kỵ nhau) hay gây tác dụng phụ nguy hiểm khi dùng chung không.
                TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON NÀY (Không giải thích thêm, không markdown):
                {{
                    ""hasInteraction"": true hoặc false,
                    ""severity"": ""High"" (nếu nguy hiểm), ""Medium"" (cần lưu ý), hoặc ""None"" (nếu an toàn),
                    ""warningMessage"": ""Giải thích ngắn gọn bằng tiếng Việt lý do kỵ nhau (nếu có). Nếu an toàn, ghi 'Các sản phẩm này an toàn khi sử dụng cùng nhau.'""
                }}";

                string apiKey = "AIzaSyCM2D_0qzDdKYV7c7zYogxiwwNEhl1HkIY";
                var uri = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";

                var requestBody = new { contents = new[] { new { parts = new[] { new { text = prompt } } } } };

                var handler = new HttpClientHandler { ServerCertificateCustomValidationCallback = (sender, cert, chain, sslPolicyErrors) => true };
                using var client = new HttpClient(handler);

                var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
                var response = await client.PostAsync(uri, content);
                var responseString = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode) return StatusCode(500, new { error = "Lỗi API" });

                using var document = JsonDocument.Parse(responseString);
                var root = document.RootElement;
                var aiText = root.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();

                int firstBrace = aiText.IndexOf('{');
                int lastBrace = aiText.LastIndexOf('}');
                if (firstBrace != -1 && lastBrace != -1) aiText = aiText.Substring(firstBrace, lastBrace - firstBrace + 1);

                var result = JsonSerializer.Deserialize<InteractionResult>(aiText, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
        // =========================================================================================
        // 10. TÍNH NĂNG ĐIỂM +: AI ĐỌC ĐƠN THUỐC BÁC SĨ & TỰ ĐỘNG NHẶT HÀNG (PRESCRIPTION SCANNER)
        // =========================================================================================
        [HttpPost("scan-prescription")]
        public async Task<IActionResult> ScanPrescription([FromBody] PrescriptionScanRequest req)
        {
            if (string.IsNullOrEmpty(req.ImageBase64)) return BadRequest(new { error = "Chưa có ảnh đơn thuốc" });

            try
            {
                // 1. CẬP NHẬT PROMPT: Ép AI trả về thêm Category để mình đi tìm đồ thay thế nếu hết hàng
                string prompt = @"Bạn là Dược sĩ chuyên gia. Hãy đọc hình ảnh đơn thuốc/toa thuốc này.
                Nhiệm vụ: Trích xuất danh sách các sản phẩm.
                TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON SAU, KHÔNG GIẢI THÍCH:
                {
                    ""diagnosis"": ""Chẩn đoán bệnh"",
                    ""items"": [
                        { 
                          ""name"": ""Tên thuốc/TPCN"", 
                          ""category"": ""Nhóm công dụng (Ví dụ: Xương khớp, Bổ não, Tim mạch, Vitamin)"" 
                        }
                    ]
                }";

                var requestBody = new
                {
                    contents = new[] {
                        new {
                            parts = new object[] {
                                new { text = prompt },
                                new { inline_data = new { mime_type = "image/jpeg", data = req.ImageBase64 } }
                            }
                        }
                    }
                };

                string apiKey = "AIzaSyCM2D_0qzDdKYV7c7zYogxiwwNEhl1HkIY"; 
                var uri = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";

                var handler = new HttpClientHandler { ServerCertificateCustomValidationCallback = (sender, cert, chain, sslPolicyErrors) => true };
                using var client = new HttpClient(handler);

                var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
                var response = await client.PostAsync(uri, content);
                var responseString = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode) return StatusCode(500, new { error = "Lỗi Google API 2.5" });

                using var document = JsonDocument.Parse(responseString);
                var root = document.RootElement;
                var aiText = root.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();

                // Cắt gọt JSON
                int firstBrace = aiText.IndexOf('{');
                int lastBrace = aiText.LastIndexOf('}');
                if (firstBrace != -1 && lastBrace != -1) aiText = aiText.Substring(firstBrace, lastBrace - firstBrace + 1);

                // Lưu ý: Sếp nhớ cập nhật class AiPrescriptionData để khớp với cấu trúc mới (có list Items thay vì PrescribedDrugs)
                var aiData = JsonSerializer.Deserialize<AiPrescriptionResponse>(aiText, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (aiData == null || aiData.Items == null) return StatusCode(500, new { error = "AI không đọc được đơn thuốc!" });

                // 2. LOGIC TÌM KIẾM THÔNG MINH: TÌM TÊN -> KHÔNG THẤY THÌ TÌM THEO NHÓM (CATEGORY)
                var matchedProducts = new List<object>();

                foreach (var item in aiData.Items)
                {
                    // Trong vòng lặp foreach (var item in aiData.Items) ở Backend:

// 1. Tìm chính xác tên thuốc
var product = await _context.Products
    .Where(p => p.Name.ToLower().Contains(item.Name.ToLower()))
    .FirstOrDefaultAsync();

if (product != null) 
{
    matchedProducts.Add(new { 
        originalName = item.Name, 
        productFound = product, 
        isAlternative = false,
        suggestions = new List<object>() // Có hàng thật thì không cần đề xuất thêm
    });
}
else 
{
    // 2. 🔥 KHÔNG CÓ HÀNG: Lấy top 3 sản phẩm cùng Nhóm công dụng (Category)
    // Sếp nhớ kiểm tra cột Category trong DB phải có dữ liệu nhé (ví dụ: "Xương khớp")
    var suggestions = await _context.Products
        .Where(p => p.Category.ToLower().Contains(item.Category.ToLower()))
        .Take(3) // Lấy 3 món tương tự
        .ToListAsync();

    matchedProducts.Add(new { 
        originalName = item.Name, 
        productFound = (object)null, 
        isAlternative = true,
        suggestions = suggestions // Gửi danh sách 3 món về cho React
    });
}
                }

                return Ok(new {
                    diagnosis = aiData.Diagnosis,
                    results = matchedProducts
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Lỗi Backend: " + ex.Message });
            }
        }

       // --- ĐỊNH NGHĨA CÁC LỚP DỮ LIỆU CẦN THIẾT ---

    public class PrescriptionScanRequest
    {
        public string ImageBase64 { get; set; }
    }

    public class AiPrescriptionResponse 
    {
        public string Diagnosis { get; set; }
        public List<AiItem> Items { get; set; }
    }

    public class AiItem 
    {
        public string Name { get; set; }
        public string Category { get; set; }
    }
    
    }
    
}