import chromadb
import os

CHROMA_PATH="chroma"

def setup_chroma():
    os.makedirs(CHROMA_PATH, exist_ok=True)

    client = chromadb.PersistentClient(path=CHROMA_PATH)

    client.get_or_create_collection("memory")
    client.get_or_create_collection("documents")

    print("✅ ChromaDB ready at db/chroma")


if __name__ == "__main__":
    setup_chroma()