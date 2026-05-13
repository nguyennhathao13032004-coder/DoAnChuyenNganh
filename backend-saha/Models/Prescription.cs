using System;

namespace backend_saha.Models
{
    public class Prescription
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string CustomerName { get; set; } // Tên khách hoặc Username
        public string ImageUrl { get; set; }     // Link ảnh đơn thuốc
        public string Note { get; set; }         // Lời nhắn của khách
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Pending"; // Pending, Processed
        // Thêm dòng này vào trong class Prescription nhé sếp
        public string? AdminReply { get; set; }
    }
}