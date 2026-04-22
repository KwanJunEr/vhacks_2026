import os
import re
from pypdf import PdfReader
from openai import OpenAI
from dotenv import load_dotenv
import tiktoken

load_dotenv()

openai_client = OpenAI(api_key=os.getenv("OPEN_API_KEY"))

EMBED_MODEL = "text-embedding-3-small"

# --- Chunking Config (in tokens) ---
CHUNK_SIZE = 400       # tokens per chunk (model max is 8191)
CHUNK_OVERLAP = 50     # token overlap between chunks
MIN_CHUNK_TOKENS = 20  # skip chunks shorter than this

enc = tiktoken.get_encoding("cl100k_base")


def clean_text(text: str) -> str:
    text = re.sub(r"-\n", "", text)
    text = re.sub(r"[\n\t\r]+", " ", text)
    text = re.sub(r" {2,}", " ", text)
    text = re.sub(r"[^\x20-\x7E]+", " ", text)
    return text.strip()


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    tokens = enc.encode(text)
    chunks = []
    start = 0

    while start < len(tokens):
        end = min(start + chunk_size, len(tokens))
        chunk_tokens = tokens[start:end]
        if len(chunk_tokens) >= MIN_CHUNK_TOKENS:
            chunks.append(enc.decode(chunk_tokens))
        start += chunk_size - overlap

    return chunks


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Batch-embed a list of texts using OpenAI text-embedding-3-small."""
    response = openai_client.embeddings.create(model=EMBED_MODEL, input=texts)
    return [item.embedding for item in response.data]


def process_documents(docs_folder: str) -> dict:
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

        file_chunks = []
        file_ids = []
        file_metadata = []

        for page_num, page in enumerate(reader.pages):
            raw_text = page.extract_text() or ""
            if not raw_text.strip():
                continue

            cleaned = clean_text(raw_text)
            chunks = chunk_text(cleaned)

            print(f"    Page {page_num + 1}: {len(chunks)} chunks")

            for chunk_idx, chunk in enumerate(chunks):
                file_chunks.append(chunk)
                file_ids.append(f"{filename}_p{page_num + 1}_c{chunk_idx}")
                file_metadata.append({
                    "source": filename,
                    "page": page_num + 1,
                    "chunk_index": chunk_idx,
                })

        if file_chunks:
            print(f"  Embedding {len(file_chunks)} chunks via OpenAI...")
            embeddings = embed_texts(file_chunks)
            all_ids.extend(file_ids)
            all_chunks.extend(file_chunks)
            all_embeddings.extend(embeddings)
            all_metadata.extend(file_metadata)

    print(f"Total chunks created: {len(all_chunks)}")

    return {
        "ids": all_ids,
        "chunks": all_chunks,
        "embeddings": all_embeddings,
        "metadata": all_metadata,
    }
