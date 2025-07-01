# Medical RAG System

A Retrieval-Augmented Generation (RAG) system for medical question answering, built with Python and FastAPI.

## Project Structure

```
HEALTH_CARE_AI/
│
├── src/                           # Source code
│   ├── crawler/                   # Data crawling
│   ├── rag_engine/               # RAG implementation
│   ├── server/                   # FastAPI server
│   └── client/                   # Client applications
│
├── data/                         # Data storage
├── models/                       # Model storage
├── vector_store/                # Vector database
└── notebooks/                   # Jupyter notebooks
└── docker/                     # docker
└── documents/                   # Save documents uploaded from client
```

## Setup

1. Create a virtual environment and install dependencies:
Window
```bash
conda env create -f environment_window.yml
```
Linux
```bash
conda env create -f environment.yml
```

<!-- 2. Install dependencies:
```bash
pip install -r requirements.txt
pip uninstall -y unstructured
pip install unstructured
```

3. Set up environment variables:
```bash
# Edit .env with your configuration
# Extend: you need to install torch if you don't have it yet (by default, torch is using cpu cause i don't have gpu in local)
``` -->

2. Set up dependency application to use Unstructure in local (linux) or you can google "how to use unstructure in local"
if you want to use unstructure api, you need to 
```bash
# !sudo apt update && sudo apt install -y \
#   libmagic-dev \
#   poppler-utils \
#   tesseract-ocr \
#   qpdf \
#   libreoffice \
#   pandoc
```

3.Set up chromaDB (create chromaDB's storage in local)
```bash
python setup.py
```

## Running the Application

1. Start the FastAPI server:
```bash
python -m uvicorn src.server.main:app --host 0.0.0.0 --port 8000 --workers 1
```

2. Access the API documentation at `http://localhost:8000/docs`

## Features

- Medical data crawling from multiple sources
- RAG-based question answering
- RESTful API interface
- Server sent events streaming
- Vector store for efficient retrieval
- Support for multiple medical websites