import chromadb
from pathlib import Path

chromadb_persistent_location = Path(__file__).parent.parent.parent / "vector_store" / "chromadb"
client = chromadb.PersistentClient(path=str(chromadb_persistent_location))
collection = client.get_collection(name="health_care_ai_documents")

print(collection.query(query_texts=["bai kiem tra so 2"],include=["documents"])["documents"][0])