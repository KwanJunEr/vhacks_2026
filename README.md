<h1> Varsity Hackathon 2026 </h1>
# 🚁 Disaster Response Command System

AI-powered autonomous disaster response with multi-agent coordination and real-time computer vision.

---

## ⚡ Quick Overview

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Planning** | Gemini 1.5 Pro | Strategic mission planning |
| **Vision** | YOLOv8 + Roboflow | Real-time detection |
| **Drones** | MCP Protocol | Autonomous execution |
| **Coordination** | Supabase | Agent memory & state |

---

## 🤖 AI Agents (5 Core)

### **Planning Layer**
- **Command Agent** - Local AI LLM orchestrator for mission planning

### **Execution Layer**
- **Drone Agent** - Executes MCP tool calls with resource constraints
- **Map Agent** - Manages 7x7 grid stigmergy & shared state

### **Analysis Layer**
- **Victim Detection Agent** - Thermal + vision for human detection
- **Structural Damage Agent** - Building collapse & damage assessment

---

## 🎯 Detection Models & Scripts

| Script | Model | Type | Speed |
|--------|-------|------|-------|
| `detect_victims.py` | Roboflow (victim-detection) | Custom | ⚡⚡ |
| `detect_general.py` | YOLOv8 | General Object Detection - Multi Class | ⚡⚡⚡ |
| `detect_collapsedBuilding.py` | Roboflow WebRTC | Disaster | ⚡⚡ |

---

## 🚀 Quick Start

```bash
# Run the web server
npm install
npm run dev

# Run victim detection (webcam)
python backend/detect_victims.py --source 0

# Run general detection (YOLOv8)
python backend/detect_general.py --source 0 --model yolov8n.pt

# Run collapsed building detection (WebRTC)
python backend/detect_collapsedBuilding.py --source 0 --source-type webcam

# Start MCP server (drone tools)
python -m src.mcp.mcp_server
```

---

## 📁 Project Structure

```
backend/
├── detect_victims.py              # Roboflow victim detector
├── detect_general.py              # YOLOv8 general detector
├── detect_collapsedBuilding.py    # Roboflow WebRTC
└── src/
    ├── agents/
    │   ├── command_agent.py       # Gemini planner
    │   ├── drone_agent.py         # MCP executor
    │   ├── map_agent.py           # Grid manager
    │   ├── victim_detection_agent.py
    │   └── structural_damage_agent.py
    ├── mcp/
    │   ├── drone_tools.py         # 7 available tools
    │   └── mcp_server.py          # FastAPI endpoint
    └── database/
        └── supabase_client.py     # PostgreSQL client
```

---

## 🔌 Configuration

Create `.env` file:
```env
LOCAL_AI_LLM_ENDPOINT=your_url
ROBOFLOW_API_KEY=your_key
ROBOFLOW_MODEL_ID=victim-detection-zz6co/3
ROBOFLOW_SERVER_URL=https://serverless.roboflow.com
ROBOFLOW_API_URL=http://localhost:9001        #This depends on whether we have the Internet on the place
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
```

---

## 🛠️ MCP Tools (Battery-Constrained)

```
list_available_drones  (0 units)
move_to               (5 units)
scan_area             (3 units)
thermal_scan          (4 units)
capture_image         (2 units)
get_battery_status    (0 units)
return_to_base        (0 units)
```

---

## 📊 Agent Orchestration

```
Gemini (Planning)
    ↓
Drone Agent (Execution via MCP)
    ↓
Map Agent (Grid Update)
    ↓
Victim/Damage Agents (Analysis)
    ↓
Replanning Trigger (if needed)
```

---

## 🎨 Features

✅ Real-time webcam processing  
✅ Multi-source input (webcam/video/RTSP)  
✅ Dual video recording (raw + analyzed)  
✅ Confidence-based filtering  
✅ Battery constraint system  
✅ Event-triggered replanning  
✅ JSON reports & logging  
✅ Auto GPU/CPU detection  

---

**Status**: Active Development | **Last Updated**: March 20, 2026

### 1. **detect_victims.py** - Roboflow Victim Detection Agent
**Type**: Real-time victim spotting  
**AI Model**: Roboflow Custom Model (`victim-detection-zz6co/3`)  
**Inference Engine**: Roboflow Inference SDK (HTTP Client)  
**Features**:
- Webcam real-time processing with dual video output (raw + analyzed)
- Video/image file batch processing
- Confidence-based filtering
- AVI to MP4 conversion via FFmpeg
- Cached detection rendering for smooth playback

**Usage**:
```bash
# Webcam
python backend/detect_victims.py --source 0

# Video file
python backend/detect_victims.py --source path/to/video.mp4 --conf 0.5

# Image
python backend/detect_victims.py --source path/to/image.jpg
```

### 2. **detect_general.py** - YOLOv8 General Purpose Detection Agent
**Type**: Multi-class object detection  
**AI Models**: YOLOv8 (all variants)
**Inference Engine**: Ultralytics YOLOv8  
**Features**:
- Supports all COCO dataset classes (80+ objects)
- Real-time webcam with dual video recording
- Batch video/image processing
- Auto GPU detection
- Progress visualization with tqdm

**Usage**:
```bash
python backend/detect_general.py --source 0 --model yolov8n.pt --conf 0.5
```

---

### 3. **detect_collapsedBuilding.py** - Roboflow WebRTC Collapsed Building Detection Agent
**Type**: Real-time collapsed building detection via WebRTC streaming  
**AI Model**: Roboflow Disaster Detection Workflow  
**Inference Engine**: Roboflow WebRTC with GPU compute (serverless.roboflow.com)  
**GPU Plans**: 
- `webrtc-gpu-small` - Low latency, basic objects
- `webrtc-gpu-medium` ⭐ **Recommended** - Balanced performance
- `webrtc-gpu-large` - High accuracy, more overhead

**Features**:
- WebRTC low-latency streaming
- Real-time frame annotation
- Prediction data via datachannel
- Multi-region support (us/eu/ap)
- Configurable timeout and GPU allocation

**Usage**:
```bash
# Webcam
python backend/detect_collapsedBuilding.py --source 0 --source-type webcam --plan webrtc-gpu-medium

# RTSP camera
python backend/detect_collapsedBuilding.py --source-type rtsp --source "rtsp://camera-ip:554/stream"

# Video file
python backend/detect_collapsedBuilding.py --source-type video --source video.mp4
```
---

---

## 📊 Model Comparison

| Agent | Model | Engine | Speed | Accuracy | Best For |
|-------|-------|--------|-------|----------|----------|
| detect_victims.py | Roboflow Custom | Roboflow | ⚡⚡ Medium | Domain-specific | Victim detection |
| detect_general.py | YOLOv8 | Ultralytics | Varies | Varies | General detection |
| detect_collapsedBuilding.py | Roboflow Disaster | Roboflow | ⚡⚡⚡ GPU | Specialized | Collapsed buildings |

---

## 🔧 Installation & Setup

### Prerequisites
```bash
# Python 3.11+
python --version

# CUDA (optional, for GPU acceleration)
# https://developer.nvidia.com/cuda-toolkit
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Configuration
Create/update `.env` file in project root:
```env
# Roboflow Configuration
ROBOFLOW_API_URL=http://localhost:9001          # Local inference server
ROBOFLOW_SERVER_URL=https://serverless.roboflow.com  # Cloud streaming
ROBOFLOW_API_KEY=your_roboflow_api_key
ROBOFLOW_MODEL_ID=victim-detection-zz6co/3

# Optional: Custom workspace
ROBOFLOW_WORKSPACE=rabbitmomo
```

---
---

## 🚀 Quick Start Guide

### 1️⃣ Webcam Real-Time Detection (Fastest)
```bash
cd c:\Users\koknginhao\rabbitmomoProject\vhacks_2026
python backend/detect_people.py --source 0 --model yolov8n.pt --conf 0.4 --fps 30
```
Press **Q** to quit.

### 2️⃣ Analyze Earthquake Disaster Video
```bash
python backend/detect_building_damage.py \
  --source "path/to/earthquake_video.mp4" \
  --model yolov8m-seg.pt \
  --conf 0.3 \
  --report
```

### 3️⃣ Real-Time Victim Detection (Roboflow)
```bash
python backend/detect_victims.py --source 0 --conf 0.5
```

### 4️⃣ WebRTC Streaming (Cloud-based)
```bash
python backend/detect_collapsedBuilding.py \
  --source 0 \
  --source-type webcam \
  --plan webrtc-gpu-medium
```

---

### JSON Report Example
```json
{
  "total_frames": 503,
  "total_detections": 25,
  "severity_breakdown": {
    "CRITICAL": 0,
    "HIGH": 5,
    "MEDIUM": 20,
    "LOW": 0
  },
  "frame_analysis": [
    {
      "frame": 200,
      "detections": 1,
      "severity": "HIGH",
      "objects": ["collapsed_building"]
    }
  ]
}
```

---

## 🔌 API Integration

### Backend Integration (main.py)
Routes for disaster detection API:
- `POST /api/upload` - Upload video/image for analysis
- `GET /api/disaster-detect` - Run detection endpoint
- `GET /api/webcam` - Real-time webcam stream

### Frontend (Next.js)
- Dashboard with detection visualization
- Real-time analytics
- Report generation

---

## ⚙️ Configuration Options

### Common Parameters

```bash
--source          "0" for webcam, file path, or RTSP URL
--model           Model weights file (yolov8n.pt, yolov8m.pt, etc.)
--conf            Confidence threshold (0.0-1.0, default: 0.5)
--iou             IoU threshold for NMS (0.0-1.0, default: 0.45)
--imgsz           Input image size (default: 640)
--device          "cpu" or "0" for GPU
--project         Output directory (default: ml/yolov8/outputs)
--name            Subdirectory name (default: detection_type)
--fps             Webcam FPS (auto-detect if not specified)
--save-crop       Save cropped detections
--save-txt        Save detection data as txt files
--report          Generate JSON assessment report
```


## 📝 License

vhacks_2026 - Varsity Hackathon 2026 Project

---

## 👥 Contributors

- Development Team: Penang Farm Food
- Lead: Jonas Kwan
- Team Member: Kok Ngin Hao, Ling Yu Qian

---

**Last Updated**: March 20, 2026  
**Status**: Active Development
