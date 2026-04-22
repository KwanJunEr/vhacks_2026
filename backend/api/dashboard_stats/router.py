from fastapi import APIRouter
import random
from .schemas import (
    AICoordinationAccuracyPoint,
    AICoordinationAccuracyResponse,
    SwarmMetrics,
)

router = APIRouter(tags=["dashboard"])

def fluctuate(base, variance):
    return round(base + random.uniform(-variance, variance), 2)

@router.get("/metrics", response_model=SwarmMetrics)
def get_metrics():
    return SwarmMetrics(
        swarm_efficiency=fluctuate(98.0, 1.5),
        utilization_rate=fluctuate(92.0, 4.0),
        drone_failures=12,
        avg_recovery=max(10, int(fluctuate(45, 10))),
        coordination_accuracy=fluctuate(94.0, 2.0),
        critical_events=3,
    )


@router.get("/ai-coordination-accuracy", response_model=AICoordinationAccuracyResponse)
def get_ai_coordination_accuracy():
    labels = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"]
    data = [
        AICoordinationAccuracyPoint(
            label=label,
            accuracy=round(random.uniform(89.0, 96.0), 1),
        )
        for label in labels
    ]
    return AICoordinationAccuracyResponse(data=data)