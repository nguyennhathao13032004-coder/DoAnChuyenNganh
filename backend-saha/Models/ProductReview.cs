using System;

namespace backend_saha.Models
{
    public class ProductReview
    {
        public int Id { get; set; }
        public Guid ProductId { get; set; } // Đánh giá cho sản phẩm nào
        public Guid UserId { get; set; } // Ai đánh giá (Tạm thời test có thể để string nếu sếp chưa làm Login, nhưng ở đây em setup chuẩn Guid cho trùng với bảng Users của sếp)
        public string UserName { get; set; } = string.Empty; // Tên hiển thị ra web
        
        public int Rating { get; set; } // Số sao (1 đến 5)
        public string Comment { get; set; } = string.Empty; // Nội dung khen/chê
        
        // 2 CÁI MÁC "ĂN TIỀN" CỦA SẾP ĐÂY:
        public bool IsVerifiedPurchase { get; set; } = false; // Tích xanh: Đã mua thật
        public bool IsPharmacistApproved { get; set; } = false; // Tích xanh: Dược sĩ đã kiểm duyệt chuyên môn
        
        public DateTime CreatedAt { get; set; }
    }
}