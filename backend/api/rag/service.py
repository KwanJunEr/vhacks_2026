import os
from backend.rag.embedder import process_documents
from backend.rag.vector_store import (
    load_into_chroma,
    reset_collection,
    get_count,
    is_ready,
    get_collection_info,
)

DOCS_FOLDER = os.path.join(os.path.dirname(__file__), "../../public/documents")


def get_pdf_files() -> list[str]:
    """
    Return list of PDF filenames found in the documents folder.
    Raises if folder missing or no PDFs found.
    """
    if not os.path.exists(DOCS_FOLDER):
        raise FileNotFoundError(
            f"Documents folder not found: {DOCS_FOLDER}"
        )

    pdf_files = [f for f in os.listdir(DOCS_FOLDER) if f.endswith(".pdf")]

    if not pdf_files:
        raise ValueError("No PDF files found in the documents folder")

    return pdf_files


def service_process() -> dict:
    """
    Full RAG processing pipeline:
      1. Validate documents folder + PDF files exist
      2. Wipe existing vectors first (prevent duplicates on re-process)
      3. Chunk + embed all PDFs
      4. Load into ChromaDB
    
    Returns:
      {
        success: bool,
        embeddings_created: int,
        documents_processed: int,
        message: str
      }
    """
    # Step 1: Validate
    pdf_files = get_pdf_files()

    print(f"\n🚀 Starting RAG processing for {len(pdf_files)} file(s)...")
    print(f"   Files: {', '.join(pdf_files)}")

    # Step 2: Wipe existing vectors to prevent duplicate IDs on re-process
    print("\n🗑️  Wiping existing vectors before re-processing...")
    reset_collection()

    # Step 3: Process PDFs → chunks + embeddings
    data = process_documents(DOCS_FOLDER)

    # Step 4: Load into ChromaDB
    count = load_into_chroma(data)

    return {
        "success": True,
        "embeddings_created": count,
        "documents_processed": len(pdf_files),
        "message": (
            f"Successfully processed {len(pdf_files)} document(s) "
            f"and created {count} embeddings"
        ),
    }


def service_status() -> dict:
    """
    Return full ChromaDB collection info.
    
    Returns:
      {
        is_ready: bool,
        vector_count: int,
        chroma_path: str,
        collection_name: str,
        loaded_documents: list[str]
      }
    """
    return get_collection_info()


def service_reset() -> dict:
    """
    Wipe all vectors from ChromaDB.
    
    Returns:
      {
        success: bool,
        message: str,
        vector_count: int   <- confirms 0 after wipe
      }
    """
    reset_collection()

    # Confirm wipe was successful
    remaining = get_count()

    return {
        "success": True,
        "message": "Vector store cleared — process documents again to rebuild",
        "vector_count": remaining,  # should always be 0
    }