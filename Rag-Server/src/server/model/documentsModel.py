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
    conn.commit()
    cursor.close()
    conn.close()

async def save_chunks_into_chroma(chunks):
    documents = [doc.page_content for doc in chunks]  # chỉ lấy nội dung văn bản
    metadatas = [doc.metadata for doc in chunks]      # lấy metadata tương ứng (nếu dùng)
    chunks_ids = [str(uuid.uuid4()) for _ in chunks]

    collection.add(documents=documents,metadatas=metadatas,ids=chunks_ids)

async def delete_document_by_file_name(file_name):
    # Xóa row trong MySQL
    conn = get_mysql_connection()
    cursor = conn.cursor()
    delete_query = """
        DELETE FROM documents WHERE file_name = %s
    """
    cursor.execute(delete_query, (file_name,))
    conn.commit()
    cursor.close()
    conn.close()

    # Xóa vector trong ChromaDB theo metadata['source']
    # Lấy tất cả các id có metadata['source'] == file_name
    results = collection.get(where={"source": file_name})
    ids_to_delete = results.get("ids", [])
    if ids_to_delete:
        collection.delete(ids=ids_to_delete)

async def get_document_location_by_file_name(file_name):
    conn = get_mysql_connection()
    cursor = conn.cursor()
    select_query = """
        SELECT file_location FROM documents WHERE file_name = %s
    """
    cursor.execute(select_query, (file_name,))
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    if result:
        return result[0]
    return None

async def do_query_for_all_documents():
    conn = get_mysql_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM documents"
    cursor.execute(query)
    result = cursor.fetchall()
    
    conn.commit()
    cursor.close()
    conn.close()
    return result


