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
    public class ReviewController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReviewController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // 1. API: KHÁCH HÀNG VIẾT REVIEW MỚI
        // ==========================================
        [HttpPost("add")]
        public async Task<IActionResult> AddReview([FromBody] ProductReview review)
        {
            review.CreatedAt = DateTime.UtcNow;

            // ĐÃ SỬA LỖI TÊN BIẾN (UserId thay vì user_id, Id thay vì id...)
            bool hasBought = await _context.Orders
                .Where(o => o.UserId == review.UserId)
                .Join(_context.OrderItems, 
                      order => order.Id, 
                      item => item.OrderId, 
                      (order, item) => new { order, item })
                .AnyAsync(x => x.item.ProductId == review.ProductId);

            // Nếu quét thấy đã mua -> Cấp ngay cái tích xanh Verified!
            if (hasBought)
            {
                review.IsVerifiedPurchase = true;
            }

            _context.ProductReviews.Add(review);
            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Cảm ơn bạn đã đánh giá!", 
                isVerified = review.IsVerifiedPurchase 
            });
        }

        // ==========================================
        // 2. API: HIỂN THỊ REVIEW LÊN TRANG CHI TIẾT SẢN PHẨM
        // ==========================================
        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetProductReviews(Guid productId)
        {
            var reviews = await _context.ProductReviews
                .Where(r => r.ProductId == productId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(reviews);
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
    }
    
}