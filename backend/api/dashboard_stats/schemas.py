from pydantic import BaseModel

class SwarmMetrics(BaseModel):
    swarm_efficiency: float
    utilization_rate: float
    drone_failures: int
    avg_recovery: int  # seconds
    coordination_accuracy: float
    critical_events: int