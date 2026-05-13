using System;

namespace backend_saha.Models
{
    public class HealthRecord
    {
        public int Id { get; set; }
        
        // Tạm thời mình dùng Tên hoặc Số điện thoại để phân biệt khách hàng
        // (Nếu sếp có làm Login rồi thì dùng UserId)
        public string PatientName { get; set; } = string.Empty; 
        
        public DateTime RecordDate { get; set; } // Ngày ghi nhận
        
        public float Weight { get; set; } // Cân nặng (kg)
        public float SleepHours { get; set; } // Số giờ ngủ 
        public int PainLevel { get; set; } // Mức độ đau mỏi (Thang điểm 1 đến 10)
    }
}