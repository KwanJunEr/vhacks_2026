# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Disaster Command Grid — a disaster swarm coordination system using autonomous drone fleets, multi-agent AI orchestration, and real-time computer vision. Built for Varsity Hackathon 2026.

Two independently runnable services:
- **Backend**: FastAPI + SQLite + ChromaDB (`/backend`)
- **Frontend**: Next.js 16 + Tailwind CSS 4 + Three.js (`/disaster_command`)

---

## Commands

### Backend (FastAPI)

```bash
cd backend

# Activate virtualenv (Windows)
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run dev server (hot reload, port 8000)
python main.py
# or
uvicorn main:app --reload --port 8000

# Database setup (run once)
python db/setup/sqlite_setup.py
python db/setup/chroma_setup.py

# Seed data
python db/data_scripts/drones_scripts.py
python db/data_scripts/users_scripts.py

# Debug / inspect DB
python db/debug/drones_print.py
```

### Frontend (Next.js)

```bash
cd disaster_command

npm install
npm run dev        # dev server on port 3000
npm run build      # production build
npm run lint       # ESLint
```

### Computer Vision (from repo root)

```bash
# Victim detection (webcam)
python backend/detect_victims.py --source 0 --conf 0.5

# General YOLOv8 detection
python backend/detect_general.py --source 0 --model yolov8n.pt --conf 0.5

# Collapsed building detection (Roboflow WebRTC)
python backend/detect_collapsedBuilding.py --source 0 --source-type webcam --plan webrtc-gpu-medium
```

### MCP Server

```bash
python -m src.mcp.mcp_server
```

---

## Environment Variables

**`backend/.env`** — currently empty; set as needed:
```env
LOCAL_AI_LLM_ENDPOINT=your_url
ROBOFLOW_API_KEY=your_key
ROBOFLOW_MODEL_ID=victim-detection-zz6co/3
ROBOFLOW_SERVER_URL=https://serverless.roboflow.com
ROBOFLOW_API_URL=http://localhost:9001
```

**`disaster_command/.env`**:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## Architecture

### Backend

```
backend/
├── main.py                        # FastAPI app, CORS, root router
├── api/
│   ├── router.py                  # Mounts all sub-routers under /api
│   ├── core/
│   │   ├── database.py            # SQLite connection (db/app.db)
│   │   └── security.py            # SHA-256 password hashing
│   ├── login/                     # POST /api/login
│   ├── dashboard_stats/           # GET /api/metrics (simulated swarm KPIs)
│   └── drones/                    # GET /api/drones/telemetry, /api/drones/detailed_fleet
└── db/
    ├── app.db                     # SQLite — users + drones tables
    ├── chroma/                    # ChromaDB persistence (memory + documents collections)
    ├── setup/                     # One-time DB initialisation scripts
    └── data_scripts/              # Seeding scripts
```

Each API module follows the pattern: `router.py` → `schemas.py` → `service.py`. The database layer uses synchronous `sqlite3` (not async despite `aiosqlite` being installed).

**Key dependencies**: FastAPI, LangChain + LangGraph (multi-agent orchestration), ChromaDB (vector memory), MCP/FastMCP (Model Context Protocol), google-generativeai (Gemini).

### Frontend

```
disaster_command/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   ├── login/page.tsx             # Login (stores user in localStorage)
│   ├── (main)/                    # Authenticated shell
│   │   ├── layout.tsx             # Sidebar + header nav
│   │   ├── dashboard/page.tsx     # KPI grid, Globe3D, fleet charts
│   │   ├── events/page.tsx        # Disaster event listing + mission cards
│   │   ├── fleet/page.tsx         # Drone fleet management
│   │   ├── computer-vision/page.tsx # Upload/webcam victim detection UI
│   │   ├── analytics/page.tsx
│   │   ├── reports/page.tsx
│   │   └── resources/page.tsx
│   └── api/
│       ├── upload/route.ts        # Proxies file to detect_victims.py
│       └── webcam/route.ts        # Spawns detect_victims.py as background process
├── components/
│   ├── dashboard/                 # KPI cards, Gantt, fleet charts, alerts
│   ├── events/                    # AgentGraph (SVG multi-agent visualiser), DroneOps, MissionControlPanel
│   ├── landing/                   # Marketing sections
│   ├── login/                     # UserDropdown, LoginSuccessModal
│   └── ui/                        # shadcn primitives (Button, Card, Badge, etc.)
└── public/
    └── analyzed_videos/           # Output from computer vision pipeline
```

**Auth pattern**: No JWT. Login calls `POST /api/login`, stores user object in `localStorage`. Protected pages read from `localStorage` in a `useEffect`.

**API calls**: All backend calls use `process.env.NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:8000`). Dashboard polls `/api/metrics` every 2 seconds.

**3D Globe**: Dashboard uses `@react-three/fiber` + `@react-three/drei` rendering `Globe3D.tsx` inside a `<Canvas>`.

### Data Flow

```
Frontend (Next.js)
  ↕ REST
FastAPI Backend
  ↕ SQL          ↕ Vector queries
SQLite (drones/users)   ChromaDB (memory/documents)
```

Computer vision runs as a **separate Python process** — the Next.js API route (`/api/upload`, `/api/webcam`) spawns it via `child_process.execFile` rather than calling the FastAPI backend.

---

## Database Schema

**SQLite (`db/app.db`)**
- `users`: id, username, name, email, password_hash (SHA-256), role (admin/operator/analyst/viewer), is_active, created_at, last_login
- `drones`: id, drone_name, status (idle/flying/scanning/returning/rescuing/supplying), battery_level

**ChromaDB (`db/chroma/`)**
- `memory` collection — agent working memory
- `documents` collection — mission/incident documents

---

## Adding New API Modules

Follow the existing pattern: create a folder under `backend/api/<module>/` with `__init__.py`, `router.py`, `schemas.py`, `service.py`, then register the router in `backend/api/router.py`.
