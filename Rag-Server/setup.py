# tao collection chroma voi set embedding model 
def __main__():
    import chromadb
    from pathlib import Path
    from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

    embedding_fn = SentenceTransformerEmbeddingFunction(
        model_name="VoVanPhuc/sup-SimCSE-VietNamese-phobert-base"
    )
    chromadb_persistent_location = Path(__file__).parent / "vector_store" / "chromadb"
    client = chromadb.PersistentClient(path=str(chromadb_persistent_location))
    client.create_collection(name="health_care_ai_documents",embedding_function=embedding_fn)
    # client.delete_collection("health_care_ai_documents")
if __name__ == "__main__":
    __main__()