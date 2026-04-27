import logging
from google import genai
from supabase import create_client, Client
from app.core.config import SUPABASE_URL, SUPABASE_KEY, API_KEYS, EMBEDDING_MODEL

logger = logging.getLogger(__name__)

# Khoi tao Supabase client va Gemini client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
_genai_client = genai.Client(api_key=API_KEYS[0])


def search_medical_knowledge(query: str, threshold: float = 0.5) -> str:
    """
    Chuyen cau hoi thanh Vector va tim kiem trong Supabase (bang medical_documents).
    Tra ve kien thuc y khoa dang text cho AI doc.
    Tool nay duoc AI tu dong goi khi nguoi dung hoi ve benh ly, trieu chung.
    """
    logger.info("--- [TOOL: search_medical_knowledge] Bat dau ---")
    logger.info("Query: '%s' | Nguong: %.2f", query, threshold)

    # Buoc 1: Tao embedding vector tu cau hoi dung model Gemini
    logger.info("Buoc 1: Tao embedding voi model '%s'...", EMBEDDING_MODEL)
    emb_result = _genai_client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=query
    )
    query_vector = emb_result.embeddings[0].values
    logger.info("Buoc 1: Tao embedding thanh cong. Do dai vector: %d", len(query_vector))

    # Buoc 2: Goi ham RPC tren Supabase de tim tai lieu tuong tu
    logger.info("Buoc 2: Goi RPC 'match_medical_documents' tren Supabase...")
    response = supabase.rpc(
        "match_medical_documents",
        {
            "query_embedding": query_vector,
            "match_threshold": threshold,
            "match_count": 3
        }
    ).execute()

    so_ket_qua = len(response.data) if response.data else 0
    logger.info("Buoc 2: Supabase tra ve %d tai lieu.", so_ket_qua)

    # Buoc 3: Xu ly va dinh dang ket qua
    if not response.data:
        logger.warning("Khong tim thay tai lieu phu hop voi nguong %.2f.", threshold)
        return "Khong tim thay du lieu y khoa noi bo phu hop voi cau hoi nay."

    context = "DU LIEU Y KHOA TIM THAY:\n"
    for i, doc in enumerate(response.data):
        context += f"--- Nguon {i + 1} ---\n{doc['content']}\n\n"

    logger.info("Tra ve %d tai lieu tim duoc cho AI.", so_ket_qua)
    return context