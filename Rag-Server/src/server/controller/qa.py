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
    asyncio.create_task(stream_chatbot(question,retrieval_docs,queue,False))

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
        results = collection.query(
            query_texts=[question],
            include=["documents", "distances"],  # hoặc "embeddings", tùy cách bạn config
            n_results=10  # lấy nhiều hơn 5 để có dữ liệu lọc
        )
        documents = results["documents"][0]
        scores = results["distances"][0]
        print(scores)
        threshold = 0.3
        filtered_docs = [
            doc for doc, score in zip(documents, scores) if score < threshold
        ]
        retrieval_docs = filtered_docs[:5]
        return StreamingResponse(
            streaming_output(question,retrieval_docs),
            media_type="text/event-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 