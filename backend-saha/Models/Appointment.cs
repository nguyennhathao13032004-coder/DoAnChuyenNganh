using System;

namespace backend_saha.Models
{
    public class Appointment
    {
        public int Id { get; set; }
        public string PatientName { get; set; } = string.Empty; // Tên bệnh nhân
        
        public DateTime AppointmentDate { get; set; } // Ngày giờ khách muốn hẹn
        
        public string Status { get; set; } = "Pending"; // Trạng thái: Pending (Chờ duyệt), Confirmed (Đã duyệt)
        
        public string MeetLink { get; set; } = string.Empty; // Link Google Meet (Admin sẽ thêm vào sau)
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}