import re
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.agent.chatbot import chat_with_saha

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Chat"])


class ChatRequest(BaseModel):
    message: str


class ProductCard(BaseModel):
    id: str
    name: str
    price: int


class ChatResponse(BaseModel):
    status: str
    answer: str
    products: Optional[List[ProductCard]] = None


def _parse_products_from_answer(answer: str, supabase_client) -> Optional[List[ProductCard]]:
    """
    Quet chuoi tra loi cua AI tim cac the [ID:xxx].
    Neu tim thay, tra ve danh sach ProductCard.
    Neu khong co, tra ve None.
    """
    ids = re.findall(r"\[ID:([^\]]+)\]", answer)
    if not ids:
        return None

    logger.info("Tim thay %d ID san pham trong cau tra loi cua AI.", len(ids))
    cards = []
    for pid in ids:
        pid = pid.strip()
        try:
            r = supabase_client.table("products").select("id, name, price").eq("id", pid).single().execute()
            if r.data:
                cards.append(ProductCard(
                    id=r.data["id"],
                    name=r.data["name"],
                    price=int(r.data["price"])
                ))
        except Exception as e:
            logger.warning("Khong the lay thong tin san pham id=%s: %s", pid, e)

    return cards if cards else None


@router.post("/chat", response_model=ChatResponse)
async def process_chat(request: ChatRequest):
    user_msg = request.message.strip()

    if not user_msg:
        raise HTTPException(status_code=400, detail="Tin nhan khong duoc de trong.")

    try:
        # Goi AI Agent xu ly tin nhan
        raw_answer = chat_with_saha(user_msg)

        # Lam sach the [ID:xxx] khoi cau tra loi hien thi cho nguoi dung
        clean_answer = re.sub(r"\s*\[ID:[^\]]+\]", "", raw_answer).strip()

        # Parse danh sach san pham neu AI co tra ve
        from supabase import create_client
        from app.core.config import SUPABASE_URL, SUPABASE_KEY
        sb = create_client(SUPABASE_URL, SUPABASE_KEY)
        products = _parse_products_from_answer(raw_answer, sb)

        return ChatResponse(
            status="success",
            answer=clean_answer,
            products=products
        )

    except Exception as e:
        # Day thang loi goc cua Python ra ngoai Frontend de debug
        logger.error("Loi xu ly chat: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))