# backend/ingest.py
import fitz  # PyMuPDF
import os
import pickle
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

MODEL = SentenceTransformer("all-MiniLM-L6-v2")
DIMENSION = 384
INDEX_PATH = "data/faiss_index.bin"
CHUNKS_PATH = "data/chunks.pkl"

def extract_text_from_pdf(pdf_path: str) -> str:
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def chunk_text(text: str, chunk_size=500, overlap=50):
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i+chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks

def ingest_pdfs(pdf_folder: str = "data/pdfs"):
    os.makedirs(pdf_folder, exist_ok=True)
    os.makedirs("data", exist_ok=True)

    all_chunks = []

    pdf_files = [f for f in os.listdir(pdf_folder) if f.endswith(".pdf")]

    if not pdf_files:
        print("No PDFs found!")
        return 0

    for pdf_file in pdf_files:
        path = os.path.join(pdf_folder, pdf_file)
        print(f"Processing: {pdf_file}")
        text = extract_text_from_pdf(path)
        chunks = chunk_text(text)
        for chunk in chunks:
            all_chunks.append({
                "text": chunk,
                "source": pdf_file
            })

    print(f"Total chunks: {len(all_chunks)}")

    # Embed chunks
    texts = [c["text"] for c in all_chunks]
    embeddings = MODEL.encode(texts, show_progress_bar=True)

    # Save FAISS index
    index = faiss.IndexFlatL2(DIMENSION)
    index.add(np.array(embeddings, dtype="float32"))
    faiss.write_index(index, INDEX_PATH)

    # Save chunks
    with open(CHUNKS_PATH, "wb") as f:
        pickle.dump(all_chunks, f)

    print(f"Ingested {len(all_chunks)} chunks!")
    return len(all_chunks)

if __name__ == "__main__":
    ingest_pdfs()