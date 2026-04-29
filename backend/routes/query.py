from fastapi import APIRouter
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
import os
import json
import re

load_dotenv()

router = APIRouter()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class QueryRequest(BaseModel):
    query: str

@router.get("/health")
def health():
    return {"status": "OK", "service": "NuclearMind AI Query Engine"}

@router.post("/analyze")
def analyze(body: QueryRequest):
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": """You are a senior nuclear and renewable energy engineer.
Analyze the query and respond ONLY in this exact JSON format:
{
  "title": "brief title max 10 words",
  "category": "NUCLEAR or RENEWABLE or GRID or SAFETY",
  "risk_level": "HIGH or MEDIUM or LOW",
  "summary": "2-3 sentence technical summary",
  "key_findings": ["finding 1", "finding 2", "finding 3"],
  "recommendation": "1-2 sentence engineering recommendation"
}"""
            },
            {
                "role": "user",
                "content": body.query
            }
        ],
        temperature=0.3,
        max_tokens=800,
    )

    raw = response.choices[0].message.content
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if match:
        return json.loads(match.group())
    return {"summary": raw}