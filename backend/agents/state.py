from typing import TypedDict, List, Dict, Any, Optional, Annotated
import operator

class AgentState(TypedDict):
    """The state of the multi-agent system."""
    mission_id: str
    scenario: str  # 'default' or 'survivor_detection'
    messages: Annotated[List[Dict[str, Any]], operator.add]
    next_agent: str
    drone_fleet: List[Dict[str, Any]]
    grid_map: List[Dict[str, Any]]
    survivors: List[Dict[str, Any]]
    hazards: List[Dict[str, Any]]
    mission_plan: List[Dict[str, Any]]
    reasoning_log: Annotated[List[Dict[str, Any]], operator.add]
    voice_output: Optional[str]
    hitl_approved: bool
    mission_complete: bool
