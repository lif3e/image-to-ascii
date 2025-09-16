# Image to ASCII

A full-stack project using **FastAPI (backend)** and **React + Vite (frontend)**.

## Setup
### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # or .\.venv\Scripts\Activate.ps1 on Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
