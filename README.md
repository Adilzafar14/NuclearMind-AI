# ⚛️ NuclearMind AI

> AI-Powered Nuclear & Renewable Energy Intelligence Platform

Built for the nuclear and renewable energy engineering domain.
Designed to support companies like Assystem Radicon in Saudi Arabia's Vision 2030.

## 🚀 Features

- 🧠 **RAG Pipeline** — Ask questions, get answers from IAEA documents
- ⚛️ **Nuclear Analysis** — AI-powered site evaluation & safety analysis
- 🌞 **Renewable Energy** — Solar & wind energy intelligence
- 📄 **PDF Ingestion** — Upload any engineering document
- ⚡ **Fast API** — Production-ready REST API

## 🛠️ Tech Stack

- **Backend** — FastAPI + Python
- **AI/LLM** — Groq (Llama 3.1)
- **Vector DB** — FAISS
- **Embeddings** — SentenceTransformers
- **PDF Processing** — PyMuPDF

## 📦 Installation

```bash
git clone https://github.com/Adilzafar14/NuclearMind-AI.git
cd NuclearMind-AI/backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## ⚙️ Setup

Create `.env` file in `backend/`:
```env
GROQ_API_KEY=your_key_here
```

## 🏃 Run

```bash
uvicorn main:app --reload --port 8000
```

## 📡 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/analyze` | POST | AI nuclear analysis |
| `/api/rag` | POST | IAEA document Q&A |
| `/api/ingest` | POST | Upload & process PDFs |
| `/api/health` | GET | System health check |

## 🌍 Use Cases

- Nuclear power plant site evaluation
- IAEA safety standards compliance
- Renewable energy site analysis
- Engineering document intelligence

## 📄 License

MIT License — Open Source