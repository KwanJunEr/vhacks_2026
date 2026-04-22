import os
import re
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

# --- Chunking Config ---
CHUNK_SIZE = 512        # characters per chunk
CHUNK_OVERLAP = 128     # characters of overlap between chunks
MIN_CHUNK_LENGTH = 50   # skip chunks shorter than this



def clean_text(text: str) -> str:
    """
    Clean raw PDF extracted text:
    - Remove excessive whitespace and newlines
    - Fix broken hyphenated words (e.g. "infor-\nmation" -> "information")
    - Strip non-printable characters
    """
    # Fix hyphenated line breaks
    text = re.sub(r"-\n", "", text)

    # Replace newlines/tabs with space
    text = re.sub(r"[\n\t\r]+", " ", text)

    # Collapse multiple spaces into one
    text = re.sub(r" {2,}", " ", text)

    # Remove non-printable/control characters
    text = re.sub(r"[^\x20-\x7E]+", " ", text)

    return text.strip()


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """
    Split text into overlapping chunks by character count.

    Example with chunk_size=20, overlap=5:
      text = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      chunk 1: ABCDEFGHIJKLMNOPQRST        (0  -> 20)
      chunk 2: PQRSTUVWXYZ...              (15 -> 35)  <- 5 char overlap
    """
    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = start + chunk_size

        # If not at the end, try to break at a sentence boundary
        # so chunks don't cut mid-sentence
        if end < text_length:
            # Look for last sentence-ending punctuation within the chunk
            boundary = max(
                text.rfind(". ", start, end),
                text.rfind("? ", start, end),
                text.rfind("! ", start, end),
            )
            # Only use boundary if it's reasonably far into the chunk
            # (at least 50% through) to avoid tiny chunks
            if boundary != -1 and boundary > start + (chunk_size * 0.5):
                end = boundary + 1  # include the period

        chunk = text[start:end].strip()

        if len(chunk) >= MIN_CHUNK_LENGTH:
            chunks.append(chunk)

        # Move start forward by (chunk_size - overlap)
        # This is what creates the overlap
        start += chunk_size - overlap

    return chunks


def process_documents(docs_folder: str) -> dict:
    """
    Read all PDFs in docs_folder, clean + chunk text, create embeddings.
    """
    all_ids = []
    all_chunks = []
    all_embeddings = []
    all_metadata = []

    pdf_files = [f for f in os.listdir(docs_folder) if f.endswith(".pdf")]
    if not pdf_files:
        raise ValueError(f"No PDF files found in: {docs_folder}")

    print(f"Found {len(pdf_files)} PDF(s) to process...")

    for filename in pdf_files:
        path = os.path.join(docs_folder, filename)
        reader = PdfReader(path)

        print(f"  Processing: {filename} ({len(reader.pages)} pages)")

        for page_num, page in enumerate(reader.pages):
            raw_text = page.extract_text() or ""
            if not raw_text.strip():
                continue  # skip empty pages

            cleaned = clean_text(raw_text)
            chunks = chunk_text(cleaned)

            print(f"    Page {page_num + 1}: {len(chunks)} chunks")

            for chunk_idx, chunk in enumerate(chunks):
                chunk_id = f"{filename}_p{page_num + 1}_c{chunk_idx}"
                embedding = model.encode(chunk).tolist()

                all_ids.append(chunk_id)
                all_chunks.append(chunk)
                all_embeddings.append(embedding)
                all_metadata.append({
                    "source": filename,
                    "page": page_num + 1,
                    "chunk_index": chunk_idx
                })

    print(f"Total chunks created: {len(all_chunks)}")

    return {
        "ids": all_ids,
        "chunks": all_chunks,
        "embeddings": all_embeddings,
        "metadata": all_metadata
    } 