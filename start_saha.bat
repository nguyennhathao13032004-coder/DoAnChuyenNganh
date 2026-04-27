@echo off
echo ====================================================
echo    Khoi dong SaHa AI Backend
echo    Thu muc: DoAnChuyenNganh - Copy
echo ====================================================
echo.

cd /d "D:\DoAnChuyenNganh - Copy\saha-backend-ai"

echo [1/2] Kich hoat moi truong ao (venv_new)...
call venv_new\Scripts\activate.bat

echo [2/2] Khoi chay FastAPI Server tai http://127.0.0.1:8000
echo       Nhan CTRL+C de dung server.
echo.
python main.py

pause
