from fastapi import APIRouter
import random
from .schemas import SwarmMetrics

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