using System;

namespace backend_saha.Models // Nhớ đổi 'backend_saha' thành tên project thực tế của bạn
{
    public class AiChatLog
    {
        public int Id { get; set; }
        public string UserEmail { get; set; } = "Guest";
        public string UserMessage { get; set; }
        public string AiResponse { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}