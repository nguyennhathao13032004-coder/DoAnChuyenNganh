namespace backend_saha.Models
{
    public class SnapMatchRequest
    {
        public string ImageBase64 { get; set; }
    }

    // 2. Khuôn mẫu dữ liệu AI sẽ trả về cho C# (JSON)
    public class AiRecognizedProduct
    {
        public string ProductName { get; set; }
        public List<string> MainIngredients { get; set; }
        public string MedicalPurpose { get; set; }
    }
}