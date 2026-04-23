from typing import Dict, Any, List
from agents.mcp_client import MCPClient
from agents.state import AgentState
from rag.retriever import answer_question

class KnowledgeAgent:
    """Agent responsible for providing context using RAG."""
    
    def __init__(self, mcp_client: MCPClient):
        self.mcp_client = mcp_client

    def process(self, state: AgentState) -> Dict[str, Any]:
        """Enrich the mission context with historical or environmental knowledge."""
        self.mcp_client.log_reasoning(
            "Knowledge Agent",
            f"Retrieving contextual intelligence for scenario: {state['scenario']}",
            "retrieval"
        )
        
        # Example query based on scenario or current hazards
        query = f"How to respond to a {state['scenario']} in a disaster zone with survivors and hazards?"
        if state['hazards']:
            hazard_names = [h['name'] for h in state['hazards']]
            query += f" Specifically dealing with: {', '.join(hazard_names)}"

        rag_result = answer_question(query)
        
        self.mcp_client.log_reasoning(
            "Knowledge Agent",
            f"Knowledge retrieved: {rag_result['answer'][:100]}...",
            "knowledge_complete"
        )
        
        return {
            "knowledge_summary": rag_result['answer'],
            "knowledge_sources": rag_result['sources'],
            "next_agent": "Mission Agent"
        }
