from fastapi import APIRouter, HTTPException
from api.rag.service import service_process, service_status, service_reset, service_query
from api.rag.schema import ProcessResponse, StatusResponse, ResetResponse, QueryRequest, QueryResponse

router = APIRouter(prefix="/rag", tags=["RAG"])


@router.post("/process", response_model=ProcessResponse)
async def process():
    """
    Process all PDFs in public/documents/ and load into ChromaDB.
    Automatically wipes existing vectors before re-processing.
    """
    try:
        result = service_process()
        return ProcessResponse(**result)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status", response_model=StatusResponse)
async def status():
    """
    Get current ChromaDB state — vector count, loaded documents, ready status.
    """
    try:
        result = service_status()
        return StatusResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reset", response_model=ResetResponse)
async def reset():
    """
    Wipe all vectors from ChromaDB.
    """
    try:
        result = service_reset()
        return ResetResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/query", response_model=QueryResponse)
async def query(body: QueryRequest):
    """
    Answer a question using RAG — embed query, retrieve top chunks, generate answer.
    """
    try:
        result = service_query(body.question)
        return QueryResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))