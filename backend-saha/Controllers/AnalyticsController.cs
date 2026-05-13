using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_saha.Data;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace backend_saha.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnalyticsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AnalyticsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            try 
            {
                // 1. Đếm tổng số TPCN thực tế trong kho
                var totalProducts = await _context.Products.CountAsync();

                // 2. Đếm tổng số đơn hàng thực tế
                var totalOrders = await _context.Orders.CountAsync();

                // 3. TÍNH TỔNG DOANH THU THỰC TẾ
                // Lưu ý: Em giả định cột tổng tiền của sếp tên là TotalAmount. 
                // Nếu sếp đặt tên khác (ví dụ: TotalPrice, Amount...) thì đổi chữ TotalAmount thành tên của sếp nhé.
                decimal totalRevenue = 0;
                if (totalOrders > 0)
                {
                    totalRevenue = await _context.Orders.SumAsync(o => o.TotalAmount);
                }

                // 4. VẼ BIỂU ĐỒ TỪ DỮ LIỆU THẬT CỦA NĂM HIỆN TẠI
                var currentYear = DateTime.Now.Year;

                // Lấy tất cả đơn hàng của năm nay 
                // (Em giả định cột ngày đặt hàng là CreatedAt, nếu sếp dùng OrderDate thì đổi lại nhé)
                var ordersThisYear = await _context.Orders
                    .Where(o => o.CreatedAt.Year == currentYear)
                    .ToListAsync(); // Kéo về bộ nhớ RAM để GroupBy cho mượt, không bị lỗi SQL

                // Nhóm đơn hàng theo Tháng và tính tổng tiền từng tháng
                var monthlyRevenue = ordersThisYear
                    .GroupBy(o => o.CreatedAt.Month)
                    .ToDictionary(
                        g => g.Key, // Tháng (1 đến 12)
                        g => g.Sum(o => o.TotalAmount) // Tổng doanh thu của tháng đó
                    );

                // Tạo mảng 12 tháng để ném cho Frontend vẽ biểu đồ
                var chartData = new List<object>();
                for (int i = 1; i <= 12; i++)
                {
                    chartData.Add(new {
                        name = "Tháng " + i,
                        DoanhThu = monthlyRevenue.ContainsKey(i) ? monthlyRevenue[i] : 0
                    });
                }

                return Ok(new {
                    totalProducts,
                    totalOrders,
                    totalRevenue,
                    chartData
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi thống kê dữ liệu: " + ex.Message });
            }
        }
    }
}