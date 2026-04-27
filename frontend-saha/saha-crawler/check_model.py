import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

print("DANH SÁCH CÁC MODEL EMBEDDING MÀ TÀI KHOẢN CỦA BẠN ĐƯỢC PHÉP DÙNG:")
for m in genai.list_models():
    if 'embedContent' in m.supported_generation_methods:
        print(f" {m.name}")