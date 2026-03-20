from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from src.mcp import drone_tools

app = FastAPI(title="Drone MCP Server")

class ToolCall(BaseModel):
    tool: str
    params: Dict[str, Any]

@app.get("/tools")
async def list_tools() -> List[str]:
    """Returns all available drone tools."""
    return list(drone_tools.BATTERY_COSTS.keys())

@app.post("/tool")
async def execute_tool(call: ToolCall) -> Dict[str, Any]:
    """Executes a drone tool via MCP."""
    tool_name = call.tool
    params = call.params
    
    if not hasattr(drone_tools, tool_name):
        raise HTTPException(status_code=404, detail=f"Tool {tool_name} not found")
    
    # Dynamically call the tool function
    tool_func = getattr(drone_tools, tool_name)
    result = await tool_func(**params)
    
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3002)
