"""
Question answering endpoints.
"""
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.rag_engine.main import call_chatbot, stream_chatbot
import asyncio
from fastapi.responses import StreamingResponse


router = APIRouter()

class Question(BaseModel):
    text: str

class Answer(BaseModel):
    answer: str


async def streaming_output(question:str):
    queue = asyncio.Queue()

    # Tạo 1 task chạy song song
    asyncio.create_task(stream_chatbot(question=question,queue=queue))

    while True:
        item = await queue.get()
        if item is None:
            yield f"data: <END>"
            break
        yield f"data: {item}"

@router.post("/", response_model=Answer)
async def ask_question(question: Question):
    """
    Ask a medical question and get an answer using RAG.
    """
    try:
        # TODO: Implement RAG-based question answering
        return StreamingResponse(
            streaming_output(question.text),
            media_type="text/event-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 