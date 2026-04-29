# backend/rag.py
import faiss
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer
from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()

MODEL = SentenceTransformer("all-MiniLM-L6-v2")
INDEX_PATH = "data/faiss_index.bin"
CHUNKS_PATH = "data/chunks.pkl"
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def load_index():
    index = faiss.read_index(INDEX_PATH)
    with open(CHUNKS_PATH, "rb") as f:
        chunks = pickle.load(f)
    return index, chunks

def search(query: str, k: int = 5):
    index, chunks = load_index()
    query_vec = MODEL.encode([query])
    distances, indices = index.search(
        np.array(query_vec, dtype="float32"), k
    )
    results = []
    for i in indices[0]:
        if i < len(chunks):
            results.append(chunks[i])
    return results

def rag_query(query: str) -> dict:
    # Step 1: Retrieve relevant chunks
    docs = search(query, k=5)
    context = "\n\n".join([d["text"] for d in docs])
    sources = list(set([d["source"] for d in docs]))

    # Step 2: Generate answer with Groq
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": """You are a senior nuclear and renewable 
energy engineer. Answer based on the provided context only.
Respond in JSON format:
{
  "title": "brief title",
  "category": "NUCLEAR or RENEWABLE or GRID or SAFETY",
  "risk_level": "HIGH or MEDIUM or LOW",
  "summary": "detailed answer based on context",
  "key_findings": ["finding 1", "finding 2", "finding 3"],
  "recommendation": "engineering recommendation",
  "sources": []
}"""
            },
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {query}"
            }
        ],
        temperature=0.3,
        max_tokens=1000,
    )

    import json, re
    raw = response.choices[0].message.content
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if match:
        result = json.loads(match.group())
        result["sources"] = sources
        return result
    return {"summary": raw, "sources": sources}