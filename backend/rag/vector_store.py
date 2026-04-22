import os
import chromadb
from dotenv import load_dotenv

load_dotenv()

# --- Config ---
CHROMA_PATH = os.getenv("CHROMA_PERSIST_PATH", "./backend/chroma_db")
COLLECTION_NAME = "knowledge_base"
BATCH_SIZE = 100  # ChromaDB recommended batch size for adding documents

# --- Client ---
# PersistentClient saves to disk so embeddings survive server restarts
chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)


def get_collection():
    """
    Get or create the ChromaDB collection.
    Uses cosine similarity (best for sentence-transformer embeddings).
    """
    return chroma_client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )


def load_into_chroma(data: dict) -> int:
    """
    Load chunks + embeddings into ChromaDB in batches.
    Batching avoids memory issues with large document sets.

    Returns total vector count after loading.
    """
    collection = get_collection()
    total = len(data["ids"])

    if total == 0:
        raise ValueError("No embeddings to load — check your documents folder")

    print(f"\n💾 Loading {total} embeddings into ChromaDB...")
    print(f"   Path: {CHROMA_PATH}")
    print(f"   Batch size: {BATCH_SIZE}")

    for i in range(0, total, BATCH_SIZE):
        batch_end = min(i + BATCH_SIZE, total)

        collection.add(
            ids=data["ids"][i:batch_end],
            documents=data["chunks"][i:batch_end],
            embeddings=data["embeddings"][i:batch_end],
            metadatas=data["metadata"][i:batch_end],
        )

        print(f"   Batch {i // BATCH_SIZE + 1}: loaded chunks {i + 1} → {batch_end}")

    final_count = collection.count()
    print(f"✅ ChromaDB now contains {final_count} vectors\n")

    return final_count


def search(query_embedding: list[float], top_k: int = 4) -> list[dict]:
    """
    Search ChromaDB for the most similar chunks to the query embedding.

    Returns list of:
      {
        chunk: str,       <- the actual text
        source: str,      <- filename
        page: int,        <- page number
        chunk_index: int, <- position within page
        score: float      <- cosine similarity (0.0 to 1.0, higher = more relevant)
      }
    """
    collection = get_collection()

    if collection.count() == 0:
        print("⚠️  ChromaDB collection is empty — process documents first")
        return []

    # Clamp top_k to available vectors to avoid ChromaDB error
    safe_top_k = min(top_k, collection.count())

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=safe_top_k,
        include=["documents", "metadatas", "distances"]
    )

    output = []
    docs = results["documents"][0]
    metas = results["metadatas"][0]
    distances = results["distances"][0]

    for i in range(len(docs)):
        # ChromaDB returns cosine distance (0=identical, 2=opposite)
        # Convert to similarity score (1=identical, 0=opposite)
        similarity = 1 - distances[i]

        output.append({
            "chunk": docs[i],
            "source": metas[i].get("source", "unknown"),
            "page": metas[i].get("page", 0),
            "chunk_index": metas[i].get("chunk_index", 0),
            "score": round(similarity, 4),
        })

    # Sort by score descending (most relevant first)
    output.sort(key=lambda x: x["score"], reverse=True)

    return output


def reset_collection():
    """
    Wipe all vectors from ChromaDB and recreate empty collection.
    Called when user clicks Reset in the UI.
    """
    print("🗑️  Resetting ChromaDB collection...")
    try:
        chroma_client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass  # collection didn't exist yet — nothing to delete
    chroma_client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )
    print("✅ Collection reset — ready for new documents")


def get_count() -> int:
    """Return total number of vectors currently stored."""
    return get_collection().count()


def is_ready() -> bool:
    """Return True if collection has at least one vector."""
    return get_collection().count() > 0


def get_collection_info() -> dict:
    """
    Return metadata about the current collection.
    Useful for the /api/rag/status endpoint.
    """
    collection = get_collection()
    count = collection.count()

    # Peek at a few entries to show which documents are loaded
    sources = []
    if count > 0:
        peek = collection.peek(limit=100)
        seen = set()
        for meta in peek["metadatas"]:
            src = meta.get("source", "unknown")
            if src not in seen:
                seen.add(src)
                sources.append(src)

    return {
        "collection_name": COLLECTION_NAME,
        "vector_count": count,
        "is_ready": count > 0,
        "chroma_path": CHROMA_PATH,
        "loaded_documents": sorted(sources),
    }