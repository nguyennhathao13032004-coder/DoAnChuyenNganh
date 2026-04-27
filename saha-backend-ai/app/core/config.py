import os
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)
load_dotenv()

# === QUÉT TỰ ĐỘNG CÁC API KEYS TỪ FILE .ENV ===
API_KEYS = []
for i in range(10):  # Quét từ KEY_0 đến KEY_9 (Dự phòng bạn thêm key sau này)
    key = os.getenv(f"GEMINI_API_KEY_{i}")
    if key:
        API_KEYS.append(key.strip())

# Tương thích ngược: Nếu chỉ có biến GEMINI_API_KEY cũ
if not API_KEYS:
    single_key = os.getenv("GEMINI_API_KEY")
    if single_key:
        API_KEYS.append(single_key.strip())

if not API_KEYS:
    raise ValueError("Lỗi: Không tìm thấy bất kỳ GEMINI_API_KEY nào trong file .env")

logger.info("Đã nạp thành công %d API Keys vào hệ thống.", len(API_KEYS))

# === CẤU HÌNH SUPABASE ===
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY]):
    raise ValueError("Lỗi: Thiếu biến môi trường Supabase.")

# === CẤU HÌNH MODEL ===
EMBEDDING_MODEL = "models/gemini-embedding-001"
CHAT_MODEL = "models/gemini-2.5-flash" # Nhớ dùng bản Pro để AI in thẻ sản phẩm chuẩn xác

safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]