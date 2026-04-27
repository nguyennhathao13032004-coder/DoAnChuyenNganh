from fastapi import APIRouter, HTTPException
import os
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/debug", tags=["Debug"])


@router.get("/status")
async def status():
    # Expose only when explicitly enabled in env
    if os.getenv("ENABLE_DEBUG_API", "false").lower() not in ("1", "true", "yes"):
        raise HTTPException(status_code=404, detail="Not Found")

    try:
        # Lazy import to avoid loading heavy AI deps unnecessarily
        from app.agent import chatbot
        data = chatbot.get_status()
        return {"status": "ok", "data": data}
    except Exception as e:
        logger.exception("Failed to get status: %s", e)
        raise HTTPException(status_code=500, detail="Unable to get status")
