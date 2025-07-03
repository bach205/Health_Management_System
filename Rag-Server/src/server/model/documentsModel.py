import uuid
from src.config.mysql import get_mysql_connection
from src.config.chroma import collection
# Save metadata to MySQL
async def save_documents_to_database(file,file_location,user_id):
    conn = get_mysql_connection()
    cursor = conn.cursor()
    insert_query = """
        INSERT INTO documents (file_name, user_id, file_location)
        VALUES (%s, %s, %s)
    """
    cursor.execute(insert_query, (file.filename, user_id, str(file_location)))
    inserted_id = cursor.lastrowid
    conn.commit()
    cursor.close()
    conn.close()
    return inserted_id

async def save_chunks_into_chroma(chunks):
    documents = [doc.page_content for doc in chunks]  # chỉ lấy nội dung văn bản
    metadatas = [doc.metadata for doc in chunks]      # lấy metadata tương ứng (nếu dùng)
    chunks_ids = [str(uuid.uuid4()) for _ in chunks]

    collection.add(documents=documents,metadatas=metadatas,ids=chunks_ids)

async def delete_document_by_id(doc_id: int):
    conn = get_mysql_connection()
    cursor = conn.cursor()
    delete_query = """
        DELETE FROM documents WHERE id = %s
    """
    cursor.execute(delete_query, (doc_id,))
    conn.commit()
    cursor.close()
    conn.close()
    # Xóa vector trong ChromaDB nếu cần (nếu metadata lưu id)
    # Nếu vẫn cần xóa theo file_name, cần truy vấn file_name trước

    # Xóa vector trong ChromaDB theo metadata['source']
    # Lấy tất cả các id có metadata['source'] == file_name
    results = collection.get(where={"doc_id": doc_id})
    ids_to_delete = results.get("ids", [])
    if ids_to_delete:
        collection.delete(ids=ids_to_delete)

async def get_document_location_by_id(id: int):
    conn = get_mysql_connection()
    cursor = conn.cursor()
    select_query = """
        SELECT file_location, file_name FROM documents WHERE id = %s
    """
    cursor.execute(select_query, (id,))
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    if result:
        return result[0], result[1]  # file_location, file_name
    return None, None

async def do_query_for_all_documents():
    conn = get_mysql_connection()
    cursor = conn.cursor(dictionary=True)
    query = "SELECT * FROM documents"
    cursor.execute(query)
    result = cursor.fetchall()
    
    conn.commit()
    cursor.close()
    conn.close()
    return result


