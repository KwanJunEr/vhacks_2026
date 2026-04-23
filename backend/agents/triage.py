from typing import Dict, Any, List
from agents.mcp_client import MCPClient
from agents.state import AgentState

class TriageAgent:
    """Agent responsible for prioritizing survivors and hazards."""
    
    def __init__(self, mcp_client: MCPClient):
        self.mcp_client = mcp_client

    def process(self, state: AgentState) -> Dict[str, Any]:
        """Determine priority scoring for survivors and hazards."""
        self.mcp_client.log_reasoning(
            "Triage Agent",
            "Analyzing survivor and hazard data for priority scoring.",
            "analysis"
        )
        
        # Use MCP tools to get current data
        survivors = self.mcp_client.call_tool("get_rescue_priority_list")
        hazards = self.mcp_client.call_tool("get_hazard_map")
        
        # Simple scoring logic (could be more complex with an LLM)
        # For now, we'll just use the scores from the DB and maybe refine them
        
        self.mcp_client.log_reasoning(
            "Triage Agent",
            f"Found {len(survivors)} survivors and {len(hazards)} hazards. Sorting by urgency.",
            "triage_complete"
        )
        
        return {
            "survivors": survivors,
            "hazards": hazards,
            "next_agent": "Knowledge Agent"
        }
