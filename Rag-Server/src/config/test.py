import chromadb
from pathlib import Path

chromadb_persistent_location = Path(__file__).parent.parent.parent / "vector_store" / "chromadb"
client = chromadb.PersistentClient(path=str(chromadb_persistent_location))
collection = client.get_collection(name="health_care_ai_documents")

results = collection.get(include=["documents", "metadatas"], limit=10)

# In ra nội dung
for doc, meta, doc_id in zip(results["documents"], results["metadatas"], results["ids"]):
    print(f"ID: {doc_id}")
    print(f"Document: {doc}")
    print(f"Metadata: {meta}")
    print("-" * 40)