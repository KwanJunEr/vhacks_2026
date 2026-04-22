from pydantic import BaseModel


class ComputerVisionAnalyzeRequest(BaseModel):
    original_filename: str


class ComputerVisionAnalyzeResponse(BaseModel):
    original_filename: str
    analyzed_filename: str
    analyzed_path: str
    message: str
