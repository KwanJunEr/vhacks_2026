from fastapi import APIRouter, HTTPException

from .schemas import ComputerVisionAnalyzeRequest, ComputerVisionAnalyzeResponse
from .service import get_computer_vision_mapping

router = APIRouter(prefix="/computer-vision", tags=["computer-vision"])


@router.post("/analyze", response_model=ComputerVisionAnalyzeResponse)
def analyze_video(request: ComputerVisionAnalyzeRequest):
    mapping = get_computer_vision_mapping(request.original_filename)

    if not mapping:
        raise HTTPException(
            status_code=404,
            detail=f"No analyzed result mapped for {request.original_filename}",
        )

    return {
        "original_filename": mapping["original_filename"],
        "analyzed_filename": mapping["analyzed_filename"],
        "analyzed_path": mapping["analyzed_path"],
        "message": "Analyzed video mapping loaded from SQLite successfully.",
    }
