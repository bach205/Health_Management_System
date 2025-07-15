"""
Main FastAPI server for the medical RAG application.
"""
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.server.controller import documentsController
from .controller import qa

app = FastAPI(
    title="Medical RAG API",
    description="API for medical question answering using RAG",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(qa.router, prefix="/api/v1/qa", tags=["QA"])
app.include_router(documentsController.router,prefix="/api/v1/documents",tags="Documents")

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000) 

#python -m uvicorn src.server.main:app --host 0.0.0.0 --port 8000 --workers 1