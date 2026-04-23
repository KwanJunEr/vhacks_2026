# 🧠 Multi-Agent Disaster Swarm System (MCP + LangGraph)

## 📌 Overview

This document defines the agent architecture for an autonomous disaster response system using MCP tools, drone swarms, and LangGraph orchestration.

The system enables:

* Real-time disaster response
* Autonomous drone coordination
* Survivor detection and rescue prioritization
* Dynamic grid-based environmental mapping

---

# 🧩 System Architecture Flow

```
Voice Agent
    ↓
Command Agent (Orchestrator)
    ↓
Triage Agent → Knowledge Agent → Mission Agent
    ↓
MCP Tool Execution Layer
    ↓
Swarm State Update (Grid + Heatmap)
    ↓
Human-in-the-Loop (Safety Override)
```

---

# 🟦 1. Command Agent (Orchestrator / System Brain)

## 🎯 Core Role

Converts mission intent into executable MCP tool workflows and coordinates all agents.

## ✅ Responsibilities

* Receives high-level mission commands (Voice / Human / System trigger)
* Breaks mission into step-by-step execution plans
* Routes tasks to Triage, Mission, and Knowledge agents
* Executes MCP tool calls via swarm system
* Coordinates drone actions in real time
* Monitors mission progress
* Handles system-level failure recovery

## ❌ Does NOT

* Decide survivor priority
* Perform spatial planning
* Run AI detection models

## 🧠 Think of it as

> Mission executor + traffic controller

---

# 🟥 2. Triage Agent (Risk & Priority Engine)

## 🎯 Core Role

Determines urgency and prioritization of survivors and hazards.

## ✅ Responsibilities

* Assign survivor priority scores
* Classify disaster severity (low / medium / critical)
* Rank rescue targets
* Identify high-risk zones
* Evaluate hazard intensity
* Generate `rescue_priority_list`
* Flag urgent rescue cases

## 🔧 MCP Tools Used

* get_rescue_priority_list
* get_hazard_map
* get_hazard_nearby

## ❌ Does NOT

* Move drones
* Assign sectors
* Plan routes

## 🧠 Think of it as

> Who gets saved first?

---

# 🟩 3. Mission Agent (Spatial Planner / Swarm Strategist)

## 🎯 Core Role

Manages spatial allocation of drones across the disaster grid.

## ✅ Responsibilities

* Divide disaster grid into sectors
* Assign drones to regions (`assign_sector`)
* Ensure full grid coverage
* Prevent overlap in scanning
* Balance drone workload
* Optimize scanning efficiency
* Reassign sectors dynamically (battery/failure response)

## 🔧 MCP Tools Used

* assign_sector
* get_grid_map
* update_coverage_grid
* mark_cell_visited

## ❌ Does NOT

* Decide survivor priority
* Execute scan logic directly

## 🧠 Think of it as

> Where should each drone go?

---

# 🟨 4. Knowledge Agent (RAG + Disaster Intelligence)

## 🎯 Core Role

Provides contextual intelligence and disaster domain knowledge.

## ✅ Responsibilities

* Interpret disaster types (earthquake, flood, fire)
* Retrieve historical disaster patterns (RAG)
* Explain hazard behavior
* Suggest response strategies
* Support triage and mission planning
* Validate environmental risks

## ❌ Does NOT

* Assign drones
* Execute MCP tools directly
* Control swarm execution

## 🧠 Think of it as

> Disaster expert brain

---

# 🟪 5. Voice Agent (Human Interface Layer)

## 🎯 Core Role

Converts speech into structured system commands and provides voice feedback.

## ✅ Responsibilities

* Speech → intent detection
* Natural language → MCP tool plan
* Voice command parsing (e.g. "send drone to sector 3")
* System status narration
* Emergency command detection (stop mission, return all drones)
* Operator interaction simplification

## ❌ Does NOT

* Make decisions
* Plan missions
* Execute MCP tools directly

## 🧠 Think of it as

> Translator between humans and swarm system

---

# 🟫 6. Human-in-the-Loop (Safety Controller)

## 🎯 Core Role

Final authority for high-risk or critical operations.

## ✅ Responsibilities

* Approve critical rescue operations
* Confirm dangerous drone deployments
* Override AI decisions
* Handle ethical constraints
* Emergency shutdown / mission abort
* Validate triage recommendations in critical cases

## ❌ Does NOT

* Operate drones directly
* Run autonomous logic

## 🧠 Think of it as

> Safety governor / mission override authority

---

# ⚙️ MCP TOOL EXECUTION RULE

> ⚠️ Only the Command Agent is allowed to execute MCP tools directly.

All other agents must return structured outputs to the Command Agent.

---

# 🔄 SWARM FEEDBACK LOOP

```
Scan → Update Grid → Triage → Replan → Execute → Repeat
```

This ensures continuous adaptation in real-time disaster environments.

---

# 🧠 GLOBAL DESIGN PRINCIPLE

Each agent answers only ONE key question:

* Voice → What did the human say?
* Command → What should happen next?
* Triage → What is most urgent?
* Mission → Where should drones go?
* Knowledge → What does this mean?
* Human → Is this allowed?

---

# 🚀 SYSTEM SUMMARY

This architecture enables:

* Autonomous drone swarm coordination
* Real-time disaster response
* AI-driven rescue prioritization
* Dynamic grid-based mapping
* Human safety override control
* Scalable MCP tool execution layer

# 🧠 7. Execution Logging & Streaming Layer (Observability)

## 🎯 Core Role

Enables real-time visibility of mission execution through structured logs, timestamps, and event streaming (HTTP SSE / WebSockets).

This layer ensures the system is transparent, debuggable, and suitable for live disaster operations dashboards.

---

## 📡 What is streamed

The Command Agent emits structured events (NOT raw chain-of-thought), including:

### ✅ 1. Execution Logs (timestamped)

* Tool calls
* Tool results
* State updates

```json
{
  "timestamp": "2026-04-23T10:15:01Z",
  "type": "tool_call",
  "tool": "discover_drones",
  "status": "success"
}
```

---

### 🧠 2. Decision Summaries (Reasoning Output)

High-level explanations of decisions made by the system.

```json
{
  "timestamp": "2026-04-23T10:15:03Z",
  "type": "decision",
  "summary": "Selected Drone_A due to closest proximity and sufficient battery level (78%)."
}
```

---

### 🚁 3. Mission Execution Events

Step-by-step operational trace of the swarm.

```json
{
  "mission_step": 3,
  "timestamp": "2026-04-23T10:15:05Z",
  "action": "move_to",
  "params": { "drone": "Drone_A", "sector": "B2" },
  "status": "in_progress"
}
```

---

### 🔄 4. Dynamic Replanning Events

Triggered when new hazards, survivors, or failures are detected.

```json
{
  "event": "replan_triggered",
  "reason": "new_survivor_detected",
  "timestamp": "2026-04-23T10:16:10Z"
}
```

---

## 🔄 Streaming Flow

```
Command Agent (Planner + Executor)
        ↓
Event Generator (structured logs)
        ↓
HTTP SSE / WebSocket Stream
        ↓
Dashboard / Operator UI (3D grid + heatmap)
```

---

## ⚙️ Key Design Rule

> ❌ Do NOT stream raw chain-of-thought
>
> ✅ DO stream structured reasoning summaries + execution traces

---

## 🧠 Why this layer is important

* Enables real-time mission monitoring
* Supports debugging of swarm behavior
* Powers live 3D heatmap visualization
* Provides audit trail for rescue operations
* Allows human-in-the-loop intervention decisions

---

## 🚀 Result

This transforms the system from:

> static multi-agent pipeline

into:

> 🔥 real-time autonomous swarm intelligence platform
