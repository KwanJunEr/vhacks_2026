"use client";

import React, { useState, useEffect, use, useRef, useCallback } from "react";
import {
  MapPin,
  Terminal,
  Plane,
  Clock,
  ChevronRight,
  AlertTriangle,
  Zap,
  Cpu,
  Map,
  Grid3X3,
  RefreshCw,
  ChevronDown,
  RotateCcw,
  RotateCw,
  Square,
  Play,
  StopCircle,
  RotateCcw as ResetIcon,
  BrainCircuit,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingOverlay } from "@/components/events/LoadingOverlay";
import { AnimatePresence, motion } from "framer-motion";
import {
  UserRoundSearch,
  CheckCircle2,
  X,
  ArrowRight,
  HeartPulse,
  Thermometer,
  Navigation,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { GridDrone, GridEntity } from "@/components/events/ThreeJSGrid";

// Dynamic imports
const ThreeJSGrid = dynamic(
  () => import("@/components/events/ThreeJSGrid").then((m) => m.ThreeJSGrid),
  { ssr: false, loading: () => <CenterLoadingPlaceholder label="Loading 3D Grid…" /> }
);
const GridLegend = dynamic(
  () => import("@/components/events/ThreeJSGrid").then((m) => m.GridLegend),
  { ssr: false }
);
const DroneGrid2D = dynamic(
  () => import("@/components/events/DroneGrid2D").then((m) => m.DroneGrid2D),
  { ssr: false, loading: () => <CenterLoadingPlaceholder label="Loading 2D Grid…" /> }
);

function CenterLoadingPlaceholder({ label }: { label: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 rounded-xl gap-3">
      <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
      <p className="text-xs text-slate-400 font-medium">{label}</p>
    </div>
  );
}

const SCENARIOS = [
  "Default",
  "Battery Crisis",
  "Search & Rescue",
  "Structural Assessment",
  "Medical Supply",
  "Evacuation Support",
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface DeploymentLog {
  id: string;
  timestamp: string;
  drone_id: string;
  drone_name: string;
  action: string;
  log: string;
  reasoning: string;
  confidence_score: number;
}

interface VisitedCell {
  x: number;
  y: number;
  scanned_by: string;
  drone_color: string;
}

// ── Action badge colours ───────────────────────────────────────────────────────
const ACTION_STYLES: Record<string, string> = {
  initialization: "bg-blue-100 text-blue-700 border-blue-200",
  triage: "bg-violet-100 text-violet-700 border-violet-200",
  triage_complete: "bg-violet-100 text-violet-700 border-violet-200",
  discover_drones: "bg-cyan-100 text-cyan-700 border-cyan-200",
  assign_sector: "bg-indigo-100 text-indigo-700 border-indigo-200",
  move_to: "bg-emerald-100 text-emerald-700 border-emerald-200",
  battery_critical: "bg-red-100 text-red-700 border-red-200",
  mission_complete: "bg-green-100 text-green-700 border-green-200",
  stop: "bg-amber-100 text-amber-700 border-amber-200",
  error: "bg-red-100 text-red-700 border-red-200",
  end: "bg-slate-100 text-slate-500 border-slate-200",
};

// ── Survivor dialog ────────────────────────────────────────────────────────────
function SurvivorDialog({ sector, onClose }: { sector: number | null; onClose: () => void }) {
  if (sector === null) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200"
      >
        <div className="relative p-8 pt-12 text-center">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-20" />
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 relative border-2 border-rose-100 shadow-inner">
                <UserRoundSearch className="w-10 h-10" />
              </div>
            </div>
          </div>
          <Badge className="bg-rose-100 text-rose-600 border-rose-200 font-black text-[10px] uppercase tracking-[0.2em] px-4 py-1 mb-4">
            Critical Detection
          </Badge>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Survivor Found!</h2>
          <p className="text-slate-500 font-medium mb-8">
            AI analysis has confirmed a positive life sign in Sector {sector}.
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { icon: HeartPulse, color: "text-rose-500", label: "Heart Rate", val: "82 BPM" },
              { icon: Thermometer, color: "text-blue-500", label: "Thermal", val: "36.8°C" },
              { icon: Navigation, color: "text-emerald-500", label: "Confidence", val: "98.4%" },
            ].map(({ icon: Icon, color, label, val }) => (
              <div key={label} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <Icon className={cn("w-4 h-4 mx-auto", color)} />
                <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
                <p className="text-sm font-black text-slate-900">{val}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <Button onClick={onClose} className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-xs shadow-xl">
              Confirm Extraction Team <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" onClick={onClose} className="w-full h-12 rounded-2xl border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
              Continue Grid Scan
            </Button>
          </div>
        </div>
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified by Command Agent</span>
          </div>
          <span className="text-[10px] font-black text-slate-300">ID: SAR-9921</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Log card ──────────────────────────────────────────────────────────────────
function LogCard({ log }: { log: DeploymentLog }) {
  const [expanded, setExpanded] = useState(false);
  const style = ACTION_STYLES[log.action] ?? "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <div
      className={cn(
        "rounded-lg border p-2.5 text-[10px] space-y-1.5 cursor-pointer hover:brightness-95 transition-all",
        style
      )}
      onClick={() => setExpanded((p) => !p)}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-black uppercase tracking-widest truncate flex-1">{log.drone_name}</span>
        <span className="font-mono opacity-60 shrink-0">{log.timestamp.slice(11, 19)}</span>
        <Badge className={cn("text-[9px] font-black px-1.5 py-0 shrink-0 border", style)}>
          {log.action.replace(/_/g, " ")}
        </Badge>
      </div>

      <p className="font-bold leading-snug">{log.log}</p>

      {expanded && (
        <div className="pt-1 space-y-1 border-t border-current/20">
          <div className="flex items-start gap-1">
            <BrainCircuit className="w-2.5 h-2.5 shrink-0 mt-0.5 opacity-70" />
            <p className="opacity-80 leading-snug">{log.reasoning}</p>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="w-2.5 h-2.5 shrink-0 opacity-70" />
            <span className="font-black">
              Confidence: {Math.round(log.confidence_score * 100)}%
            </span>
            <div className="flex-1 h-1 bg-current/20 rounded-full overflow-hidden ml-1">
              <div
                className="h-full bg-current rounded-full opacity-70"
                style={{ width: `${Math.round(log.confidence_score * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  const [isLoading, setIsLoading] = useState(true);
  const [isDeployed, setIsDeployed] = useState(false);
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [activeGridTab, setActiveGridTab] = useState<"2d" | "3d">("3d");
  const [rotationState, setRotationState] = useState<{ isRotating: boolean; direction: 1 | -1 }>({
    isRotating: false,
    direction: 1,
  });

  // Grid / WS data
  const [gridDrones, setGridDrones] = useState<GridDrone[]>([]);
  const [gridEntities, setGridEntities] = useState<GridEntity[]>([]);
  const [visitedCells, setVisitedCells] = useState<VisitedCell[]>([]);
  const [wsConnected, setWsConnected] = useState(false);

  // Deployment logs (from SSE)
  const [deployLogs, setDeployLogs] = useState<DeploymentLog[]>([]);
  const [deploymentId, setDeploymentId] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Event details
  const [event, setEvent] = useState<{
    name: string; location: string; status: string;
    event_time: string; is_active: number;
  } | null>(null);

  // Survivor dialog
  const [survivorSector, setSurvivorSector] = useState<number | null>(null);
  const [showSurvivorDialog, setShowSurvivorDialog] = useState(false);

  // SSE ref for cleanup
  const sseAbortRef = useRef<AbortController | null>(null);

  // ── Fetch event details ────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/api/disaster_events/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setEvent(data); })
      .catch(() => {});
  }, [id, API]);

  // ── /ws/grid — entity + drone snapshot every 2 s ──────────────────────────
  useEffect(() => {
    const wsUrl = API.replace(/^https?/, (m) => (m === "https" ? "wss" : "ws")) + "/ws/grid";
    let ws: WebSocket;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    const connectWs = () => {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => setWsConnected(true);
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          if (data.type === "grid_update") {
            setGridDrones(data.drones ?? []);
            setGridEntities(data.entities ?? []);
            setVisitedCells(data.visited_cells ?? []);
          }
        } catch { /* ignore */ }
      };
      ws.onerror = () => setWsConnected(false);
      ws.onclose = () => {
        setWsConnected(false);
        reconnectTimer = setTimeout(connectWs, 3000);
      };
    };

    connectWs();
    return () => { clearTimeout(reconnectTimer); ws?.close(); };
  }, [API]);

  // ── /ws/drones — real-time movement updates ───────────────────────────────
  useEffect(() => {
    if (!isDeployed) return;

    const wsUrl = API.replace(/^https?/, (m) => (m === "https" ? "wss" : "ws")) + "/ws/drones";
    let ws: WebSocket;

    ws = new WebSocket(wsUrl);
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === "drone_move") {
          setGridDrones((prev) => {
            const idx = prev.findIndex((d) => d.id === msg.drone_id);
            const updated: GridDrone = {
              id: msg.drone_id,
              name: msg.drone_name,
              status: msg.status,
              battery: msg.battery,
              color: msg.color,
              current_x: msg.x,
              current_y: msg.y,
            };
            if (idx === -1) return [...prev, updated];
            const next = [...prev];
            next[idx] = updated;
            return next;
          });
          // Also update visited cells immediately
          setVisitedCells((prev) => {
            const exists = prev.find((c) => c.x === msg.x && c.y === msg.y);
            if (exists) return prev;
            return [...prev, { x: msg.x, y: msg.y, scanned_by: msg.drone_name, drone_color: msg.color }];
          });
        }
      } catch { /* ignore */ }
    };
    ws.onerror = () => {};
    ws.onclose = () => {};

    return () => ws?.close();
  }, [isDeployed, API]);

  // ── Auto-scroll logs ───────────────────────────────────────────────────────
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [deployLogs]);

  // ── Loading ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  // ── Deploy handler ─────────────────────────────────────────────────────────
  const handleDeploy = useCallback(async () => {
    // Cancel any previous SSE stream
    sseAbortRef.current?.abort();
    const ctrl = new AbortController();
    sseAbortRef.current = ctrl;

    setIsDeployed(true);
    setDeployLogs([]);

    try {
      const res = await fetch(`${API}/api/deployment/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: scenario.toLowerCase() }),
        signal: ctrl.signal,
      });

      const depId = res.headers.get("X-Deployment-ID") ?? null;
      setDeploymentId(depId);

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const raw = line.slice(5).trim();
          if (!raw) continue;
          try {
            const evt = JSON.parse(raw) as DeploymentLog;
            if (evt.action === "end") {
              setIsDeployed(false);
              return;
            }
            setDeployLogs((prev) => [
              ...prev,
              { ...evt, id: `${Date.now()}-${Math.random()}` },
            ]);
          } catch { /* ignore malformed */ }
        }
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        setIsDeployed(false);
      }
    }
  }, [API, scenario]);

  // ── Stop handler ───────────────────────────────────────────────────────────
  const handleStop = useCallback(async () => {
    sseAbortRef.current?.abort();
    await fetch(`${API}/api/deployment/stop`, { method: "POST" });
    setIsDeployed(false);
  }, [API]);

  // ── Reset handler ──────────────────────────────────────────────────────────
  const handleReset = useCallback(async () => {
    sseAbortRef.current?.abort();
    await fetch(`${API}/api/deployment/reset`, { method: "POST" });
    setIsDeployed(false);
    setDeployLogs([]);
    setVisitedCells([]);
    setDeploymentId(null);
    // Trigger fresh WS snapshot by briefly resetting gridDrones
    setGridDrones([]);
  }, [API]);

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => sseAbortRef.current?.abort();
  }, []);

  if (isLoading) return <LoadingOverlay />;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <AnimatePresence>
        {showSurvivorDialog && (
          <SurvivorDialog sector={survivorSector} onClose={() => setShowSurvivorDialog(false)} />
        )}
      </AnimatePresence>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-3 flex items-center justify-between gap-4 flex-shrink-0 pb-4 border-b border-slate-100 z-30 relative bg-white/50 backdrop-blur-sm">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-widest">
            <Link href="/events" className="hover:text-blue-600 transition-colors">Disaster Events</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-500">ID: {id.toUpperCase()}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            {event?.name ?? "Loading Event…"}
            <Badge
              variant="destructive"
              className={cn("px-3 py-1 text-xs font-black shadow-lg",
                event?.is_active ? "animate-pulse bg-red-600 shadow-red-500/20" : "bg-slate-500 shadow-none")}
            >
              {event?.is_active ? "LIVE MISSION" : event ? "RESOLVED" : "LOADING"}
            </Badge>
          </h1>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* 3D rotation */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button
              className={cn("p-2 hover:bg-slate-50 rounded-lg transition-colors",
                rotationState.isRotating && rotationState.direction === -1 ? "bg-blue-50 text-blue-600" : "text-slate-500")}
              onClick={() => setRotationState({ isRotating: true, direction: -1 })}
            ><RotateCcw className="w-4 h-4" /></button>
            <button
              className={cn("p-2 hover:bg-slate-50 rounded-lg transition-colors",
                rotationState.isRotating && rotationState.direction === 1 ? "bg-blue-50 text-blue-600" : "text-slate-500")}
              onClick={() => setRotationState({ isRotating: true, direction: 1 })}
            ><RotateCw className="w-4 h-4" /></button>
            <button
              className={cn("p-2 hover:bg-slate-50 rounded-lg transition-colors",
                !rotationState.isRotating ? "bg-slate-100 text-slate-900" : "text-slate-500")}
              onClick={() => setRotationState((p) => ({ ...p, isRotating: false }))}
            ><Square className="w-4 h-4" /></button>
            <button
              className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors"
              onClick={() => setRotationState({ isRotating: false, direction: 1 })}
            ><RefreshCw className="w-4 h-4" /></button>
          </div>

          {/* Scenario selector */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Scenario:</span>
            <div className="relative flex items-center">
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                disabled={isDeployed}
                className="appearance-none bg-transparent text-sm font-bold text-slate-800 pr-6 cursor-pointer focus:outline-none disabled:cursor-default disabled:text-slate-500"
              >
                {SCENARIOS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-0 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <Link href="/logs">
            <Button variant="outline" className="h-11 px-5 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600 font-black uppercase tracking-widest text-[10px] gap-2 shadow-sm">
              <Terminal className="w-4 h-4 text-blue-500" /> Logs
            </Button>
          </Link>

          {/* Deploy / Stop / Reset */}
          {!isDeployed ? (
            <Button
              onClick={handleDeploy}
              className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black uppercase tracking-widest shadow-lg shadow-emerald-500/25 gap-2"
            >
              <Play className="w-4 h-4" /> Start Deployment
            </Button>
          ) : (
            <Button
              onClick={handleStop}
              className="h-11 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-black uppercase tracking-widest shadow-lg gap-2"
            >
              <StopCircle className="w-4 h-4" /> Stop
            </Button>
          )}

          <Button
            onClick={handleReset}
            variant="outline"
            className="h-11 px-5 rounded-xl border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-600 font-black uppercase tracking-widest text-[10px] gap-2 shadow-sm"
          >
            <ResetIcon className="w-4 h-4" /> Reset
          </Button>
        </div>

        {/* Location + time */}
        <div className="flex items-center gap-5 text-sm text-slate-500 font-medium flex-shrink-0">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-red-500" />
            {event?.location ?? "Loading…"}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            {event?.event_time
              ? new Date(event.event_time).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
              : "Just now"}
          </span>
        </div>
      </div>

      {/* ── Status row ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-shrink-0 mb-4 px-1">
        <div className="flex items-center gap-4">
          <Badge className="bg-slate-900 text-white font-black text-xs uppercase tracking-widest px-4 py-2 rounded-xl">
            Live Swarm Status
          </Badge>
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
            <div className="flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs font-black text-slate-700">{gridDrones.length} DRONES</span>
            </div>
            <div className="w-px h-3 bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <UserRoundSearch className="w-3.5 h-3.5 text-red-500" />
              <span className="text-xs font-black text-slate-700">
                {gridEntities.filter((e) => e.type === "survivor").length} SURVIVORS
              </span>
            </div>
            <div className="w-px h-3 bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <Grid3X3 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-black text-slate-700">{visitedCells.length}/400 CELLS</span>
            </div>
          </div>
          <span className="flex items-center gap-2 text-xs font-bold">
            <span className={cn("w-2 h-2 rounded-full", wsConnected ? "bg-emerald-500 animate-pulse" : "bg-red-400")} />
            <span className={wsConnected ? "text-emerald-600" : "text-red-500"}>
              {wsConnected ? "SYSTEM ONLINE" : "SYSTEM OFFLINE"}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold px-3 py-1">
            Active Drones: {gridDrones.filter(d => d.status !== "idle").length}
          </Badge>
          <Badge variant="outline" className={cn("font-bold px-3 py-1",
            isDeployed ? "border-emerald-200 text-emerald-600 bg-emerald-50" : "border-slate-200 text-slate-500")}>
            {isDeployed ? "DEPLOYING" : "STANDBY"}
          </Badge>
        </div>
      </div>

      {/* ── Main 3-Column Layout ─────────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 overflow-hidden pb-4">

        {/* Left Column — Incident & Sensors */}
        <div className="col-span-12 lg:col-span-2 flex flex-col gap-4 overflow-y-auto pr-1 scrollbar-hide">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Incident Reporting
            </h3>
            <div className={cn(
              "flex items-center gap-2 mb-4 text-xs font-bold text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border",
              isDeployed ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-100"
            )}>
              <div className={cn("w-2 h-2 rounded-full", isDeployed ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
              {isDeployed ? "MISSION ACTIVE" : "STANDBY"}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Report Event:</p>
            <div className="flex flex-wrap gap-1.5">
              {["🔥 Fire", "💨 Smoke", "🌍 Quake", "🧍 Survivor", "🌊 Flood", "🏚 Collapse"].map((evt) => (
                <button key={evt} className="text-[10px] font-black px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors border border-slate-200 uppercase tracking-tighter">
                  {evt}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-blue-500" /> Sensor Telemetry
            </h3>
            {deployLogs.filter(l => l.action === "move_to").length > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>Grid Coverage</span>
                  <span className="text-emerald-600">{Math.min(100, Math.round((visitedCells.length / 400) * 100))}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (visitedCells.length / 400) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                  <span>{visitedCells.length} cells</span>
                  <span>400 total</span>
                </div>
              </div>
            ) : (
              <div className="h-20 flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-slate-100 gap-2 text-center">
                <RefreshCw className="w-5 h-5 text-slate-300 animate-spin-slow" />
                <p className="text-[9px] text-slate-300 font-bold">Awaiting mission…</p>
              </div>
            )}
          </div>
        </div>

        {/* Center Column — 3D & 2D Grid */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4 min-h-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 border border-slate-200 self-start shadow-sm">
              <button
                onClick={() => setActiveGridTab("3d")}
                className={cn("flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-widest",
                  activeGridTab === "3d" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-700 hover:bg-white/50")}
              ><Grid3X3 className="w-4 h-4" /> 3D View</button>
              <button
                onClick={() => setActiveGridTab("2d")}
                className={cn("flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-widest",
                  activeGridTab === "2d" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-700 hover:bg-white/50")}
              ><Map className="w-4 h-4" /> 2D Tactical</button>
            </div>
            <Badge variant="outline" className="border-blue-200 text-blue-600 font-black uppercase tracking-tighter bg-blue-50/50">
              {activeGridTab.toUpperCase()} Mode
            </Badge>
          </div>

          <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative min-h-[750px]">
            <AnimatePresence mode="wait">
              {activeGridTab === "3d" ? (
                <motion.div key="3d" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="w-full h-full">
                  <ThreeJSGrid
                    drones={gridDrones}
                    entities={gridEntities as GridEntity[]}
                    visitedCells={visitedCells}
                    rotationState={rotationState}
                    onRotationEnd={() => setRotationState((p) => ({ ...p, isRotating: false }))}
                  />
                </motion.div>
              ) : (
                <motion.div key="2d" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="w-full h-full">
                  <DroneGrid2D
                    drones={gridDrones}
                    entities={gridEntities as GridEntity[]}
                    visitedCells={visitedCells}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column — Swarm Matrix + Live Log */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pl-1 scrollbar-hide">
          {/* Swarm Task Matrix */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-blue-500" /> Swarm Task Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left font-black text-slate-400 pb-2 pr-2 uppercase tracking-tighter">Drone</th>
                    <th className="text-left font-black text-slate-400 pb-2 pr-2 uppercase tracking-tighter">Task</th>
                    <th className="text-right font-black text-slate-400 pb-2 uppercase tracking-tighter">Batt</th>
                  </tr>
                </thead>
                <tbody>
                  {gridDrones.length > 0 ? (
                    gridDrones.map((d) => (
                      <tr key={d.id} className="border-b border-slate-50 last:border-0">
                        <td className="py-2 pr-2 font-black text-blue-600">{d.name}</td>
                        <td className={cn("py-2 pr-2 font-bold uppercase tracking-tighter",
                          d.status === "idle" ? "text-slate-400" : d.status === "returning" ? "text-amber-600" : "text-emerald-600")}>
                          {d.status}
                        </td>
                        <td className="py-2 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <div className="w-8 h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={cn("h-full", d.battery > 50 ? "bg-emerald-500" : d.battery > 20 ? "bg-amber-500" : "bg-red-500")}
                                style={{ width: `${d.battery}%` }}
                              />
                            </div>
                            <span className="font-black text-slate-700 tabular-nums">{d.battery}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={3} className="py-6 text-center text-slate-400 font-bold italic text-[10px]">No active drones</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mission status */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", isDeployed ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
              Mission Status
            </h3>
            <div className="flex justify-between items-center py-2 bg-slate-50 rounded-lg px-3 border border-slate-100">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{scenario}</span>
              <Badge className={cn("text-[10px] font-black px-2 py-0.5",
                isDeployed ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                {isDeployed ? "ACTIVE" : "STANDBY"}
              </Badge>
            </div>
            {deploymentId && (
              <p className="text-[9px] font-mono text-slate-300 mt-2 truncate">ID: {deploymentId}</p>
            )}
          </div>

          {/* Live Activity Log */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-blue-500" /> Live Activity Log
              </h3>
              <div className="flex items-center gap-1.5">
                {isDeployed && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
                <span className="text-[9px] font-black text-slate-400 uppercase">{deployLogs.length} events</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar">
              {deployLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-2 text-center py-8 opacity-50">
                  <Terminal className="w-6 h-6 text-slate-300" />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Awaiting deployment…</p>
                </div>
              ) : (
                deployLogs.slice(-60).map((log) => (
                  <LogCard key={log.id} log={log} />
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
