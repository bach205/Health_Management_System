from fastapi.responses import  StreamingResponse,FileResponse
import time
from fastapi import APIRouter, UploadFile, File,Form,HTTPException
from pydantic import BaseModel
from typing import Union
from src.server.service.documentsService import save_documents, delete_documents, get_document_file,query_for_all_documents
class my_response(BaseModel):
    status:int
    message:Union[str,dict]
    data: Union[dict, list, str, int, float, bool, None] = None
router = APIRouter()

@router.post("/file/upload")
async def document_processing(file: UploadFile = File(...),user_id: int = Form(...)):
    """
    Save documents.
    """
    try:
        result = await save_documents(file,user_id)
        return my_response(
            status=201,
            message={"filename": result.filename, "content_type": result.content_type}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/file/{id}")
async def delete_document(id: int):
    try:
        await delete_documents(id)
        return my_response(status = 200, message =  f"Deleted document id {id} successfully")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/file/{id}")
async def get_document(id: int):
    file_path, file_name = await get_document_file(id)
    if file_path:
        return FileResponse(file_path, filename=file_name)
    else:
        raise HTTPException(status_code=404, detail="File not found")

@router.get("/")
async def get_all_documents():
    try:
        all_docs = await query_for_all_documents()
        return my_response(status=200,message="Get all documents succesfully",data=all_docs)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=404, detail="File not found")

def generate_sse(question):
    for i in range(0,len(question)):
        time.sleep(1)  # Giả lập xử lý
        yield f"data: {question[i]}\n\n"
    yield "data: <END>\n\n"

@router.get("/stream_response")
def sse_endpoint(question: str):
    return StreamingResponse(generate_sse(question), media_type="text/event-stream")