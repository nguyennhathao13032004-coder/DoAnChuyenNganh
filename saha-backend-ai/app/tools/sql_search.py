import logging
from supabase import create_client, Client
from app.core.config import SUPABASE_URL, SUPABASE_KEY

logger = logging.getLogger(__name__)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def search_saha_products(keyword: str = "", origin: str = "", brand: str = "") -> str:
    """Tra cứu sản phẩm với cơ chế Nới lỏng truy vấn (Query Relaxation)"""
    
    # 1. Làm sạch dữ liệu đầu vào
    words_to_remove = ["danh mục", "sản phẩm", "thuốc", "thực phẩm", "chức năng", "các loại"]
    clean_keyword = keyword.lower() if keyword else ""
    for w in words_to_remove:
        clean_keyword = clean_keyword.replace(w, "")
    clean_keyword = clean_keyword.strip()
    
    clean_origin = origin.replace("từ", "").replace("xuất xứ", "").strip() if origin else ""
    clean_brand = brand.strip() if brand else ""

    logger.info("--- [TOOL: search_saha_products] ---")
    
    # Hàm tiện ích đóng gói logic tìm kiếm theo tên/danh mục để tái sử dụng
    def get_base_keyword_query():
        q = supabase.table("products").select("id")
        if clean_keyword:
            cat_res = supabase.table("categories").select("id").ilike("name", f"%{clean_keyword}%").execute()
            if cat_res.data:
                return q.eq("category_id", cat_res.data[0]["id"])
            else:
                return q.ilike("name", f"%{clean_keyword}%")
        return q

    try:
        # BƯỚC 1: TÌM CHÍNH XÁC 100% (STRICT MATCH)
        strict_q = get_base_keyword_query()
        if clean_origin:
            strict_q = strict_q.ilike("origin", f"%{clean_origin}%")
        if clean_brand:
            strict_q = strict_q.ilike("brand", f"%{clean_brand}%")
            
        strict_res = strict_q.limit(5).execute()
        
        if strict_res.data:
            res = "FOUND\n"
            for p in strict_res.data:
                res += f"[ID:{p['id']}] "
            return res
            
        # BƯỚC 2: TÌM NỚI LỎNG (RELAXED MATCH)
        if (clean_origin or clean_brand) and clean_keyword:
            logger.info("Không khớp Hãng/Xuất xứ. Thử tìm nới lỏng chỉ dùng Keyword: '%s'", clean_keyword)
            relaxed_q = get_base_keyword_query()
            relaxed_res = relaxed_q.limit(5).execute()
            
            if relaxed_res.data:
                res = "FOUND_RELAXED\n"
                for p in relaxed_res.data:
                    res += f"[ID:{p['id']}] "
                return res
                
    except Exception as e:
        logger.warning("Lỗi truy vấn SQL: %s", e)
        
    # BƯỚC 3: FALLBACK (Không tìm thấy gì cả)
    fallback = supabase.table("products").select("id").limit(3).execute()
    if not fallback.data:
        return "KHO_TRONG"
        
    res = "FALLBACK\n"
    for p in fallback.data:
        res += f"[ID:{p['id']}] "
    return res

# =========================================================
# TOOL MỚI: XEM CHI TIẾT SẢN PHẨM ĐỂ AI TƯ VẤN SÂU
# =========================================================
def get_product_details(product_id: str) -> str:
    """
    Dùng để tra cứu chi tiết thành phần, công dụng, cách dùng, giá bán của một sản phẩm CỤ THỂ 
    khi khách hàng hỏi sâu về sản phẩm đó (Ví dụ: hộp này thành phần là gì, uống sao, giá bao nhiêu).
    """
    logger.info("--- [TOOL: get_product_details] Đang tra cứu ID: %s ---", product_id)
    try:
        # Lấy toàn bộ thông tin của dòng sản phẩm đó
        res = supabase.table("products").select("*").eq("id", product_id).execute()
        
        if res.data:
            p = res.data[0]
            # Gom thông tin lại thành 1 đoạn văn cho AI đọc
            info = f"Tên: {p.get('name')}\n"
            info += f"Giá: {p.get('price')} VND\n"
            info += f"Thương hiệu: {p.get('brand', 'Chưa rõ')}\n"
            info += f"Xuất xứ: {p.get('origin', 'Chưa rõ')}\n"
            info += f"Mô tả/Thành phần: {p.get('description', 'Đang cập nhật')}\n"
            return info
            
        return "Lỗi: Không tìm thấy sản phẩm này trong kho."
    except Exception as e:
        logger.error("Lỗi get_product_details: %s", e)
        return "Lỗi cơ sở dữ liệu."