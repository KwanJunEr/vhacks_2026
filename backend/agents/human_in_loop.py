from typing import Dict, Any
from agents.mcp_client import MCPClient
from agents.state import AgentState

class HumanInLoopAgent:
    """Agent responsible for safety checks and human approvals."""
    
    def __init__(self, mcp_client: MCPClient):
        self.mcp_client = mcp_client

    def process(self, state: AgentState) -> Dict[str, Any]:
        """Request approval for critical mission actions."""
        self.mcp_client.log_reasoning(
            "Human-in-the-Loop",
            "Waiting for mission approval.",
            "approval_pending"
        )
        
        # In a real system, this might wait for a websocket message or a DB flag.
        # For this hackathon, we'll assume approval is granted if no hazards are critical.
        critical_hazards = [h for h in state.get('hazards', []) if h.get('severity', 0) > 8]
        
        approved = len(critical_hazards) == 0
        
        reasoning = "Mission approved: no critical hazards detected." if approved else "Mission pending: critical hazards require manual override."
        
        self.mcp_client.log_reasoning(
            "Human-in-the-Loop",
            reasoning,
            "approval_result"
        )
        
        return {
            "hitl_approved": approved,
            "next_agent": "Command Agent" if approved else "END"
        }
