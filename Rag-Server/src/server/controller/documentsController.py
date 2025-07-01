from fastapi.responses import StreamingResponse, FileResponse
import time
from fastapi import APIRouter,FastAPI, UploadFile, File,Form,HTTPException
from pydantic import BaseModel
from src.server.service.documentsService import save_documents, delete_documents, get_document_file
class response(BaseModel):
    status:int
    message:dict
router = APIRouter()

@router.post("/upload")
async def document_processing(file: UploadFile = File(...),user_id: int = Form(...)):
    """
    Save documents.
    """
    try:
        result = await save_documents(file,user_id)
        return response(
            status=201,
            message={"filename": result.filename, "content_type": result.content_type}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{file_name}")
async def delete_document(file_name: str):
    try:
        await delete_documents(file_name)
        return {"status": 200, "message": f"Deleted {file_name} successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{file_name}")
async def get_document(file_name: str):
    file_path = await get_document_file(file_name)
    if file_path:
        return FileResponse(file_path, filename=file_name)
    else:
        raise HTTPException(status_code=404, detail="File not found")
    

def generate_sse():
    for i in range(10):
        time.sleep(1)  # Giả lập xử lý
        yield f"data: Thông báo số {i + 1}\n\n"
    yield "data: Xử lý hoàn tất!\n\n"

@router.get("/stream_response")
def sse_endpoint():
    return StreamingResponse(generate_sse(), media_type="text/event-stream")