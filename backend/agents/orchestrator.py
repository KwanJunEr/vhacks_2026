import os
import uuid
from typing import Dict, Any, List, Union
from langgraph.graph import StateGraph, END
from agents.state import AgentState
from agents.mcp_client import MCPClient
from agents.triage import TriageAgent
from agents.knowledge import KnowledgeAgent
from agents.mission import MissionAgent
from agents.voice import VoiceAgent
from agents.human_in_loop import HumanInLoopAgent

def create_orchestrator():
    """Create the LangGraph mission orchestrator."""
    
    # Initialize components
    mission_id = str(uuid.uuid4())
    mcp_client = MCPClient(mission_id)
    
    triage_agent = TriageAgent(mcp_client)
    knowledge_agent = KnowledgeAgent(mcp_client)
    mission_agent = MissionAgent(mcp_client)
    voice_agent = VoiceAgent(mcp_client)
    hitl_agent = HumanInLoopAgent(mcp_client)

    # Define Nodes
    def command_node(state: AgentState):
        """Orchestrator node: initializes mission and routes."""
        mcp_client.log_reasoning(
            "Command Agent",
            f"Starting mission {state['mission_id']} with scenario: {state['scenario']}",
            "mission_start"
        )
        
        # Determine the first step
        return {"next_agent": "Triage Agent"}

    def triage_node(state: AgentState):
        result = triage_agent.process(state)
        return {**result, "messages": [{"role": "assistant", "content": "Triage complete."}]}

    def knowledge_node(state: AgentState):
        result = knowledge_agent.process(state)
        return {**result, "messages": [{"role": "assistant", "content": "Knowledge enrichment complete."}]}

    def mission_node(state: AgentState):
        result = mission_agent.process(state)
        return {**result, "messages": [{"role": "assistant", "content": "Mission planning complete."}]}

    def hitl_node(state: AgentState):
        result = hitl_agent.process(state)
        return {**result, "messages": [{"role": "assistant", "content": "Human approval processed."}]}

    def voice_node(state: AgentState):
        # Generate summary for voice
        text = f"Mission {state['scenario']} started. "
        if state.get('survivors'):
            text += f"Detected {len(state['survivors'])} survivors. "
        if state.get('mission_plan'):
            text += f"Fleet dispatched to {len(state['mission_plan'])} sectors."
            
        voice_agent.speak(text)
        return {"voice_output": text, "mission_complete": True}

    # Build Graph
    workflow = StateGraph(AgentState)

    workflow.add_node("Command Agent", command_node)
    workflow.add_node("Triage Agent", triage_node)
    workflow.add_node("Knowledge Agent", knowledge_node)
    workflow.add_node("Mission Agent", mission_node)
    workflow.add_node("Human-in-the-Loop", hitl_node)
    workflow.add_node("Voice Agent", voice_node)

    workflow.set_entry_point("Command Agent")

    # Transitions
    workflow.add_edge("Command Agent", "Triage Agent")
    workflow.add_edge("Triage Agent", "Knowledge Agent")
    workflow.add_edge("Knowledge Agent", "Mission Agent")
    workflow.add_edge("Mission Agent", "Human-in-the-Loop")
    
    def after_hitl(state: AgentState):
        if state.get("hitl_approved"):
            return "Voice Agent"
        return END

    workflow.add_conditional_edges(
        "Human-in-the-Loop",
        after_hitl,
        {
            "Voice Agent": "Voice Agent",
            END: END
        }
    )
    
    workflow.add_edge("Voice Agent", END)

    return workflow.compile()

# Example usage
if __name__ == "__main__":
    app = create_orchestrator()
    initial_state = {
        "mission_id": str(uuid.uuid4()),
        "scenario": "default",
        "messages": [],
        "next_agent": "",
        "drone_fleet": [],
        "grid_map": [],
        "survivors": [],
        "hazards": [],
        "mission_plan": [],
        "reasoning_log": [],
        "voice_output": None,
        "hitl_approved": False,
        "mission_complete": False
    }
    
    # Run the graph
    for output in app.stream(initial_state):
        print(f"--- Agent Update ---")
        print(output)
