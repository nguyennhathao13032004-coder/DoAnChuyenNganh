import logging
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.chat_router import router as chat_router

# Cau hinh logging toan cuc: moi log INFO tro len se hien thi ra Terminal
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S"
)

app = FastAPI(
    title="SaHa AI Backend",
    description="He thong Backend AI cho nha thuoc SaHa"
)

# Cau hinh CORS ket noi voi ReactJS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)


@app.get("/")
async def health_check():
    return {"status": "online", "message": "He thong SaHa AI hoat dong binh thuong."}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)