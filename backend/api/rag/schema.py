from pydantic import BaseModel


# ─────────────────────────────────────────
# RAG Schemas
# ─────────────────────────────────────────

class ProcessResponse(BaseModel):
    success: bool
    embeddings_created: int
    message: str


class StatusResponse(BaseModel):
    is_ready: bool
    vector_count: int
    chroma_path: str
    collection_name: str
    loaded_documents: list[str]


class ResetResponse(BaseModel):
    success: bool
    message: str


# ─────────────────────────────────────────
# Query Schemas
# ─────────────────────────────────────────

class QueryRequest(BaseModel):
    question: str


class SourceItem(BaseModel):
    source: str
    page: int
    score: float
    chunk_index: int = 0


class QueryResponse(BaseModel):
    answer: str
    sources: list[SourceItem]
    context_used: str | None = None


# ─────────────────────────────────────────
# Health Schema
# ─────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    rag_ready: bool
    vector_count: int