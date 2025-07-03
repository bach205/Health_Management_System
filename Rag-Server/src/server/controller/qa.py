"""
Question answering endpoints.
"""
import asyncio
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from src.rag_engine.main import call_chatbot, stream_chatbot
from fastapi.responses import StreamingResponse
from src.config.chroma import collection

router = APIRouter()

class Question(BaseModel):
    text: str

class Answer(BaseModel):
    answer: str


async def streaming_output(question:str,retrieval_docs:List[str]):
    queue = asyncio.Queue()

    # Tạo 1 task chạy song song
    asyncio.create_task(stream_chatbot(question,retrieval_docs,queue))

    while True:
        item = await queue.get()
        if item is None:
            yield f"data: <END>\n\n"
            break
        yield f"data: {item}\n\n"

@router.get("/")
async def ask_question(question: str):
    """
    Ask a medical question and get an answer using RAG.
    """
    try:
        #add retrival function
        retrieval_docs = collection.query(query_texts=[question],include=["documents"])["documents"][0]
        return StreamingResponse(
            streaming_output(question,retrieval_docs),
            media_type="text/event-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 