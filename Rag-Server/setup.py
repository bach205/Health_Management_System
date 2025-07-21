import os
from dotenv import load_dotenv
load_dotenv()

def create_database():
    import mysql.connector
    # Dùng trực tiếp biến thay vì os.getenv để đảm bảo giá trị được lấy đúng
    DATABASE_USERNAME = os.getenv("DATABASE_USERNAME")
    DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")
    DATABASE_HOST = os.getenv("DATABASE_HOST")
    DATABASE_NAME = os.getenv("DATABASE_NAME")
    # Kết nối tới MySQL server (chưa chỉ định database vì ta chuẩn bị tạo)
    conn = mysql.connector.connect(
        user=DATABASE_USERNAME,
        password=DATABASE_PASSWORD,
        host=DATABASE_HOST
    )
    cursor = conn.cursor()

    # Tạo database nếu chưa tồn tại
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DATABASE_NAME}")
    print(f"Database `{DATABASE_NAME}` created or already exists.")

    cursor.close()
    conn.close()

# tao collection chroma voi set embedding model 
def create_chromaDB():
    try:
        import chromadb
        from pathlib import Path
        from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

        embedding_fn = SentenceTransformerEmbeddingFunction(
            model_name="VoVanPhuc/sup-SimCSE-VietNamese-phobert-base"
        )
        chromadb_persistent_location = Path(__file__).parent / "vector_store" / "chromadb"
        client = chromadb.PersistentClient(path=str(chromadb_persistent_location))
        client.create_collection(name="health_care_ai_documents",embedding_function=embedding_fn,metadata={"hnsw:space": "cosine"})
        # client.delete_collection("health_care_ai_documents")
    except:
        print ("The chroma collection's name is existed")

def __main__():
    create_database()
    create_chromaDB()
if __name__ == "__main__":
    __main__()