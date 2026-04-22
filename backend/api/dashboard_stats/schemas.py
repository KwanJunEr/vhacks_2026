from pydantic import BaseModel, Field, field_validator

from api.core.time_utils import get_default_timestamp, normalize_feed_timestamp


class SwarmMetrics(BaseModel):
    swarm_efficiency: float
    utilization_rate: float
    drone_failures: int
    avg_recovery: int  # seconds
    coordination_accuracy: float
    critical_events: int


class AICoordinationAccuracyPoint(BaseModel):
    label: str
    accuracy: float


class AICoordinationAccuracyResponse(BaseModel):
    data: list[AICoordinationAccuracyPoint]


class AIConfidenceMatrixItem(BaseModel):
    label: str
    value: float


class AIConfidenceMatrixResponse(BaseModel):
    global_score: float
    items: list[AIConfidenceMatrixItem]


class FeedItem(BaseModel):
    title: str
    message: str | None = None
    timestamp: str = Field(default_factory=get_default_timestamp)

    @field_validator("timestamp", mode="before")
    @classmethod
    def normalize_timestamp(cls, timestamp: str | None) -> str:
        return normalize_feed_timestamp(timestamp)


class CriticalOperationsFeedResponse(BaseModel):
    items: list[FeedItem]