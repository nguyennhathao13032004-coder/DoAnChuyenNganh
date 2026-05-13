using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore; 
using backend_saha.Data;    
using backend_saha.Models; 
using System.Security.Cryptography;
using System.Text;
using System.Net;
using System.Globalization;
using System.Text.Json;
using System.Text;
using System.Net.Http;
namespace backend_saha.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context; 

        public OrdersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // 1. LẤY TẤT CẢ ĐƠN HÀNG (DÀNH CHO ADMIN)
        // FIX LỖI 405 KHI GỌI /api/Orders
        // ==========================================
        [HttpGet]
        public async Task<IActionResult> GetAllOrders()
        {
            try
            {
                var orders = await _context.Orders
                    .OrderByDescending(o => o.CreatedAt)
                    .ToListAsync();
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("{userId:guid}")]
public async Task<IActionResult> GetUserOrders(Guid userId)
{
    try
    {
        var orders = await _context.Orders
            .Include(o => o.OrderItems) // Kéo theo chi tiết từ DB
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new 
            {
                // Giữ nguyên thông tin vỏ đơn hàng
                id = o.Id,
                createdAt = o.CreatedAt,
                status = o.Status,
                shippingAddress = o.ShippingAddress,
                totalAmount = o.TotalAmount,
                
                orderItems = o.OrderItems.Select(item => new 
                {
                    // Lấy tên thật và ảnh thật từ bảng Product (phải có nối bảng Product)
                    productName = item.Product != null ? item.Product.Name : "Sản phẩm",
                    imageUrl = item.Product != null ? item.Product.ImageUrl : "", 
                    quantity = item.Qty,
                    price = item.PriceAtPurchase
                }).ToList()
            })
            .ToListAsync();

        return Ok(orders);
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { error = ex.Message });
    }
}

        // ==========================================
        // 3. CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (DÀNH CHO ADMIN)
        // Cần thiết để nút "Lưu trạng thái" ở Dashboard hoạt động
        // ==========================================
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] StatusUpdateDto request)
        {
            try
            {
                var order = await _context.Orders.FindAsync(id);
                if (order == null) return NotFound("Không tìm thấy đơn hàng");

                order.Status = request.Status;
                await _context.SaveChangesAsync();
                return Ok(new { message = "Cập nhật trạng thái thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // ==========================================
        // 4. TẠO ĐƠN HÀNG (GIỮ NGUYÊN CODE SQL RAW CỦA SẾP)
        // ==========================================
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] OrderRequestDto request)
        {
            try
            {
                var newOrderId = Guid.NewGuid();
                object userIdParam = request.UserId.HasValue ? request.UserId.Value : DBNull.Value;

                var sqlOrder = "INSERT INTO orders (id, user_id, total_amount, shipping_address, status, created_at) VALUES ({0}, {1}, {2}, {3}, {4}, {5})";
                await _context.Database.ExecuteSqlRawAsync(sqlOrder, 
                    newOrderId, userIdParam, request.TotalAmount, request.ShippingAddress, "pending", DateTime.UtcNow);

                foreach (var item in request.Items)
                {
                    var sqlItem = "INSERT INTO order_items (order_id, product_id, qty, price_at_purchase) VALUES ({0}, {1}, {2}, {3})";
                    await _context.Database.ExecuteSqlRawAsync(sqlItem,
                        newOrderId, item.ProductId, item.Qty, item.PriceAtPurchase);
                }

                string paymentUrl = "";
                if (request.PaymentMethod == "banking")
                {
                    paymentUrl = GenerateVnPayUrl(newOrderId, request.TotalAmount);
                }

                return Ok(new { message = "Đặt hàng thành công!", orderId = newOrderId, paymentUrl = paymentUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Lỗi Database: " + ex.Message });
            }
        }
       [HttpGet("{orderId:guid}/ai-analysis")]
public async Task<IActionResult> GetAiAnalysis(Guid orderId)
{
    try
    {
        var orderItems = await _context.OrderItems
            .Include(oi => oi.Product) 
            .Where(oi => oi.OrderId == orderId)
            .ToListAsync();

        if (!orderItems.Any()) 
            return NotFound(new { message = "Không tìm thấy sản phẩm" });

        var drugNames = orderItems.Select(oi => oi.Product.Name).ToList();
        string drugListString = string.Join(", ", drugNames);

        string prompt = $@"Bạn là một dược sĩ chuyên nghiệp. Hãy phân tích mức độ an toàn khi sử dụng chung các loại thuốc sau: {drugListString}. 
        Chỉ trả về ĐÚNG một chuỗi JSON có định dạng sau, không giải thích gì thêm, không có markdown:
        {{
            ""isSafe"": true, 
            ""advice"": ""Lời khuyên ngắn gọn dưới 40 chữ về cách uống, tương tác hoặc lưu ý.""
        }}";

        // Key của sếp
        string apiKey = "AIzaSyCM2D_0qzDdKYV7c7zYogxiwwNEhl1HkIY";
        
        // ========================================================
        // 🔥 VŨ KHÍ HẠNG NẶNG: DÙNG URIBUILDER VÀ GEMINI 2.5 FLASH
        // ========================================================
        var uriBuilder = new UriBuilder("https", "generativelanguage.googleapis.com");
        uriBuilder.Path = "/v1beta/models/gemini-2.5-flash:generateContent";
        uriBuilder.Query = "key=" + apiKey.Trim();
        
        string geminiUrl = uriBuilder.ToString();

        var requestBody = new
        {
            contents = new[] { new { parts = new[] { new { text = prompt } } } }
        };

        using var client = new HttpClient();
        var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
        var response = await client.PostAsync(geminiUrl, content);
        var responseString = await response.Content.ReadAsStringAsync();

        // ========================================================
        // 🔥 KHÚC "BỌC THÉP": NẾU GOOGLE BÁO LỖI THÌ QUĂNG THẲNG RA ĐỂ ĐỌC
        // ========================================================
        if (!response.IsSuccessStatusCode)
        {
            return StatusCode(500, new { error = $"Google Gemini từ chối phục vụ: {responseString}" });
        }

        // Bóc tách JSON an toàn, kiểm tra xem AI có trả về "candidates" không
        using var document = JsonDocument.Parse(responseString);
        var root = document.RootElement;
        
        if (!root.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
        {
            return StatusCode(500, new { error = "Google Gemini không trả về câu trả lời. Dữ liệu gốc: " + responseString });
        }

        var aiResponseText = candidates[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        // Dọn dẹp rác markdown nếu AI lỡ chèn vào
        aiResponseText = aiResponseText.Replace("```json", "").Replace("```", "").Trim();

        // Ép kiểu chuỗi
        var realAnalysis = JsonSerializer.Deserialize<AiAnalysisResult>(aiResponseText, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        return Ok(realAnalysis);
    }
    catch (Exception ex)
    {
        // 🔥 LỖI TẠI C# THÌ IN RÕ RA ĐÂY
        return StatusCode(500, new { error = "Lỗi Code C#: " + ex.Message });
    }
}

// Class phụ giữ nguyên
public class AiAnalysisResult 
{
    public bool IsSafe { get; set; }
    public string Advice { get; set; }
}
        private string GenerateVnPayUrl(Guid orderId, decimal amount)
        {
            string vnp_TmnCode = "R0IO82L0";
            string vnp_HashSecret = "7F37Q9ZUQXHF6HI8DEZTPXM1YELS9NXY";
            string vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
            string vnp_Returnurl = "http://localhost:5173/order-history";

            VnPayLibrary vnpay = new VnPayLibrary();
            vnpay.AddRequestData("vnp_Version", "2.1.0");
            vnpay.AddRequestData("vnp_Command", "pay");
            vnpay.AddRequestData("vnp_TmnCode", vnp_TmnCode);
            vnpay.AddRequestData("vnp_Amount", ((long)(amount * 100)).ToString()); 
            
            DateTime vnTime = DateTime.UtcNow.AddHours(7);
            vnpay.AddRequestData("vnp_CreateDate", vnTime.ToString("yyyyMMddHHmmss"));
            vnpay.AddRequestData("vnp_CurrCode", "VND");
            vnpay.AddRequestData("vnp_IpAddr", "127.0.0.1"); 
            vnpay.AddRequestData("vnp_Locale", "vn");
            vnpay.AddRequestData("vnp_OrderInfo", "ThanhToanDonHang" + orderId.ToString().Replace("-", ""));
            vnpay.AddRequestData("vnp_OrderType", "other");
            vnpay.AddRequestData("vnp_ReturnUrl", vnp_Returnurl);
            vnpay.AddRequestData("vnp_TxnRef", vnTime.Ticks.ToString()); 

            return vnpay.CreateRequestUrl(vnp_Url, vnp_HashSecret);
        }
    }

    // --- GIỮ NGUYÊN CÁC CLASS HỖ TRỢ CỦA SẾP ---

    public class StatusUpdateDto { public string Status { get; set; } }

    public class VnPayLibrary
    {
        private SortedList<string, string> _requestData = new SortedList<string, string>(new VnPayCompare());

        public void AddRequestData(string key, string value)
        {
            if (!string.IsNullOrEmpty(value))
            {
                _requestData.Add(key, value);
            }
        }

        public string CreateRequestUrl(string baseUrl, string vnp_HashSecret)
        {
            StringBuilder data = new StringBuilder();
            foreach (KeyValuePair<string, string> kv in _requestData)
            {
                if (!string.IsNullOrEmpty(kv.Value))
                {
                    data.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value).Replace("+", "%20") + "&");
                }
            }
            string queryString = data.ToString();
            baseUrl += "?" + queryString;
            string signData = queryString;
            if (signData.Length > 0)
            {
                signData = signData.Remove(data.Length - 1, 1);
            }
            string vnp_SecureHash = HmacSHA512(vnp_HashSecret, signData);
            baseUrl += "vnp_SecureHash=" + vnp_SecureHash;
            return baseUrl;
        }

        private string HmacSHA512(string key, string inputData)
        {
            var hash = new StringBuilder();
            byte[] keyBytes = Encoding.UTF8.GetBytes(key);
            byte[] inputBytes = Encoding.UTF8.GetBytes(inputData);
            using (var hmac = new HMACSHA512(keyBytes))
            {
                byte[] hashValue = hmac.ComputeHash(inputBytes);
                foreach (var theByte in hashValue)
                {
                    hash.Append(theByte.ToString("x2"));
                }
            }
            return hash.ToString();
        }

        private class VnPayCompare : IComparer<string>
        {
            public int Compare(string x, string y)
            {
                if (x == y) return 0;
                if (x == null) return -1;
                if (y == null) return 1;
                var vnpCompare = CompareInfo.GetCompareInfo("en-US");
                return vnpCompare.Compare(x, y, CompareOptions.Ordinal);
            }
        }
    }

    public class OrderRequestDto
    {
        public Guid? UserId { get; set; } 
        public decimal TotalAmount { get; set; }
        public string ShippingAddress { get; set; }
        public string PaymentMethod { get; set; } 
        public List<OrderItemDto> Items { get; set; }
    }

    public class OrderItemDto
    {
        public Guid ProductId { get; set; }
        public int Qty { get; set; }
        public decimal PriceAtPurchase { get; set; }
    }
}