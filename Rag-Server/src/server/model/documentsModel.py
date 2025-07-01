import uuid
from src.config.mysql import get_mysql_connection
from src.config.chroma import collection
# Save metadata to MySQL
async def save_documents_to_database(file,file_location,user_id):
    conn = get_mysql_connection()
    cursor = conn.cursor()
    user_id = 1  # Placeholder, replace with actual user id if available
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


