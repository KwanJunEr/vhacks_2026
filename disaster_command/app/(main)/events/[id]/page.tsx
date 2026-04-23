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

// Dynamic imports to avoid SSR issues with Three.js and MapLibre
const ThreeJSGrid = dynamic(
  () => import("@/components/events/ThreeJSGrid").then((m) => m.ThreeJSGrid),
  { ssr: false, loading: () => <CenterLoadingPlaceholder label="Loading 3D Grid..." /> }
);

const MapLibreMap = dynamic(
  () => import("@/components/events/MapLibreMap").then((m) => m.MapLibreMap),
  { ssr: false, loading: () => <CenterLoadingPlaceholder label="Loading Live Map..." /> }
);

// ─── Loading placeholder ───────────────────────────────────────────────────────
function CenterLoadingPlaceholder({ label }: { label: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 rounded-xl gap-3">
      <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
      <p className="text-xs text-slate-400 font-medium">{label}</p>
    </div>
  );
}

// ─── View Toggle ──────────────────────────────────────────────────────────────
type MapView = "grid" | "live";

function ViewToggle({ view, onChange }: { view: MapView; onChange: (v: MapView) => void }) {
  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 border border-slate-200">
      <button
        onClick={() => onChange("grid")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
          view === "grid"
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        )}
      >
        <Grid3X3 className="w-3.5 h-3.5" />
        3D Grid
      </button>
      <button
        onClick={() => onChange("live")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
          view === "live"
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        )}
      >
        <Map className="w-3.5 h-3.5" />
        Live Map
      </button>
    </div>
  );
}

// ─── Grid configuration ────────────────────────────────────────────────────────
const ROWS = 7;
const COLS = 7;
const TOTAL_CELLS = ROWS * COLS;

interface DroneState {
  id: string;
  label: string;
  pos: number;
  color: string;
  status: string;
  battery: number;
  targetPath: number[];
}

const SCENARIOS = [
  "Battery Crisis",
  "Search & Rescue",
  "Structural Assessment",
  "Medical Supply",
  "Evacuation Support",
];

// ─── Survivor dialog ──────────────────────────────────────────────────────────
function SurvivorDialog({
  sector,
  onClose,
}: {
  sector: number | null;
  onClose: () => void;
}) {
  if (sector === null) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200"
      >
        <div className="relative p-8 pt-12 text-center">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
          >
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

          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            Survivor Found!
          </h2>
          <p className="text-slate-500 font-medium mb-8">
            AI analysis has confirmed a positive life sign in Sector {sector}.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <HeartPulse className="w-4 h-4 text-rose-500 mx-auto" />
              <p className="text-[10px] font-bold text-slate-400 uppercase">Heart Rate</p>
              <p className="text-sm font-black text-slate-900">82 BPM</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <Thermometer className="w-4 h-4 text-blue-500 mx-auto" />
              <p className="text-[10px] font-bold text-slate-400 uppercase">Thermal</p>
              <p className="text-sm font-black text-slate-900">36.8°C</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <Navigation className="w-4 h-4 text-emerald-500 mx-auto" />
              <p className="text-[10px] font-bold text-slate-400 uppercase">Confidence</p>
              <p className="text-sm font-black text-slate-900">98.4%</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={onClose}
              className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-900/20"
            >
              Confirm Extraction Team <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full h-12 rounded-2xl border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-[10px]"
            >
              Continue Grid Scan
            </Button>
          </div>
        </div>

        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Verified by Command Agent
            </span>
          </div>
          <span className="text-[10px] font-black text-slate-300">ID: SAR-9921</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeployed, setIsDeployed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [mapView, setMapView] = useState<MapView>("grid");
  const [scenario, setScenario] = useState(SCENARIOS[0]);

  // Grid data from backend
  const [gridDrones, setGridDrones] = useState<GridDrone[]>([]);
  const [gridEntities, setGridEntities] = useState<GridEntity[]>([]);
  const [gridLoading, setGridLoading] = useState(false);

  // Simulation State
  const [scannedCells, setScannedCells] = useState<Set<number>>(new Set());
  const [survivorSector, setSurvivorSector] = useState<number | null>(null);
  const [survivorFound, setSurvivorFound] = useState(false);
  const [showSurvivorDialog, setShowSurvivorDialog] = useState(false);
  const [missionComplete, setMissionComplete] = useState(false);

  // Sim drones
  const [drones, setDrones] = useState<DroneState[]>([]);

  const addLog = (
    message: string,
    type: "info" | "warning" | "success" | "system" | "ai" = "info",
    showActions: boolean = false
  ) => {
    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        message,
        type,
        showActions,
        timestamp: new Date().toLocaleTimeString([], {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      },
    ]);
  };

  // ── Fetch grid data from backend ────────────────────────────────────────────
  const fetchGridData = useCallback(async () => {
    setGridLoading(true);
    try {
      const res = await fetch("/api/grid-data");
      if (!res.ok) throw new Error("grid-data fetch failed");
      const data = await res.json();
      setGridDrones(data.drones ?? []);
      setGridEntities(data.entities ?? []);
    } catch {
      // silently degrade — grid will be empty
    } finally {
      setGridLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGridData();
    const interval = setInterval(fetchGridData, 5000);
    return () => clearInterval(interval);
  }, [fetchGridData]);

  // ── Sim drone init ───────────────────────────────────────────────────────────
  useEffect(() => {
    const mockData = [
      { drone_name: "Alpha-1", battery: 85 },
      { drone_name: "Alpha-2", battery: 92 },
      { drone_name: "Alpha-3", battery: 45 },
      { drone_name: "Alpha-4", battery: 12 },
    ];
    const colors = ["bg-blue-600", "bg-indigo-600", "bg-cyan-600", "bg-violet-600"];
    setDrones(
      mockData.map((d, i) => ({
        id: d.drone_name,
        label: d.drone_name,
        pos: -1,
        color: colors[i % colors.length],
        status: "STANDBY",
        battery: d.battery,
        targetPath: [],
      }))
    );
  }, []);

  const updateBatteryInDB = async (_name: string, _battery: number) => {};

  // ── Loading ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  // ── Deploy handler ───────────────────────────────────────────────────────────
  const handleDeploy = async () => {
    setIsDeployed(true);
    setIsGenerating(true);

    const randomSector = Math.floor(Math.random() * TOTAL_CELLS);
    setSurvivorSector(randomSector);
    setSurvivorFound(false);
    setShowSurvivorDialog(false);
    setMissionComplete(false);
    setScannedCells(new Set());

    addLog("Reading environmental data: Ranau Seismograph Station 14...", "system");
    await new Promise((r) => setTimeout(r, 1000));
    addLog("Detected secondary tremors (Mag 3.4) in Ranau District.", "warning");
    await new Promise((r) => setTimeout(r, 1000));
    addLog("Confirming sensor connectivity: 98% network stability.", "success");
    await new Promise((r) => setTimeout(r, 1000));

    addLog("MCP: Executing list_available_drones()...", "system");
    await new Promise((r) => setTimeout(r, 1500));
    const droneList = drones.map((d) => d.label).join(", ");
    addLog(`Discovery complete: [${droneList}] available via MCP Protocol.`, "success", true);

    await new Promise((r) => setTimeout(r, 1000));
    setIsGenerating(false);

    addLog("Command Agent: Decomposing mission goals into tactical sectors.", "ai", true);
    await new Promise((r) => setTimeout(r, 1500));
    addLog(
      `AI Reasoning: Identifying high-probability search zone in Sector ${randomSector} via thermal anomaly.`,
      "ai"
    );
    await new Promise((r) => setTimeout(r, 1000));
    addLog("Decision: Assigning Alpha-1 to A1, Alpha-2 to A7, Alpha-3 to G1, Alpha-4 to G7.", "ai", true);

    const startPositions = [0, 6, 42, 48];
    setDrones((prev) =>
      prev.map((d, i) => ({ ...d, pos: startPositions[i] || 0, status: "SEARCHING", battery: 100 }))
    );
    addLog("MCP: Broadcasting move_to() commands. Swarm entering tactical grid.", "system");
  };

  // ── Movement loop ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isDeployed || isGenerating || missionComplete) return;

    const interval = setInterval(async () => {
      if (scannedCells.size === TOTAL_CELLS) {
        setMissionComplete(true);
        addLog("MISSION COMPLETE: 100% tactical grid coverage achieved.", "success", true);
        return;
      }

      setDrones((prevDrones) => {
        let changed = false;
        const nextDrones = prevDrones.map((drone) => {
          if (drone.pos === -1) return drone;

          if (drone.battery <= 0 || drone.status === "RECHARGING") {
            if (drone.status === "RECHARGING") {
              const rechargedBattery = Math.min(100, (drone.battery || 0) + 50);
              if (rechargedBattery === 100) {
                const droneIdx = prevDrones.indexOf(drone);
                const startPos = [0, 6, 42, 48][droneIdx] || 0;
                addLog(`${drone.label}: Recharging complete. Resuming scan.`, "success", true);
                return { ...drone, pos: startPos, status: "SEARCHING", battery: 100 };
              }
              return { ...drone, battery: rechargedBattery };
            }
            if (drone.pos !== -1) {
              addLog(`ALERT: ${drone.label} battery depleted. Emergency docking.`, "warning");
              changed = true;
              return { ...drone, pos: -1, status: "RECHARGING", battery: 0 };
            }
            return drone;
          }

          const moves = [-1, 1, -COLS, COLS];
          const validMoves = moves.filter((move) => {
            const newPos = drone.pos + move;
            if (newPos < 0 || newPos >= TOTAL_CELLS) return false;
            if (move === -1 && drone.pos % COLS === 0) return false;
            if (move === 1 && (drone.pos + 1) % COLS === 0) return false;
            return true;
          });

          const unscannedMoves = validMoves.filter((m) => !scannedCells.has(drone.pos + m));

          let nextMove: number | undefined;
          const droneRow = Math.floor(drone.pos / COLS);
          const droneCol = drone.pos % COLS;
          const survivorRow = Math.floor((survivorSector || 0) / COLS);
          const survivorCol = (survivorSector || 0) % COLS;
          const distToSurvivor =
            Math.abs(droneRow - survivorRow) + Math.abs(droneCol - survivorCol);

          if (survivorSector !== null && !survivorFound && distToSurvivor <= 2) {
            nextMove = validMoves.find((m) => {
              const newPos = drone.pos + m;
              const newDist =
                Math.abs(Math.floor(newPos / COLS) - survivorRow) +
                Math.abs((newPos % COLS) - survivorCol);
              return newDist < distToSurvivor;
            });
          }

          if (!nextMove && unscannedMoves.length > 0) {
            nextMove = unscannedMoves[Math.floor(Math.random() * unscannedMoves.length)];
          }

          if (!nextMove) {
            let minTargetDist = Infinity;
            let targetMove = validMoves[Math.floor(Math.random() * validMoves.length)];
            const unscannedArr = Array.from({ length: TOTAL_CELLS })
              .map((_, i) => i)
              .filter((i) => !scannedCells.has(i));
            if (unscannedArr.length > 0) {
              const targetCell = unscannedArr[0];
              const tRow = Math.floor(targetCell / COLS);
              const tCol = targetCell % COLS;
              validMoves.forEach((m) => {
                const newPos = drone.pos + m;
                const d =
                  Math.abs(Math.floor(newPos / COLS) - tRow) +
                  Math.abs((newPos % COLS) - tCol);
                if (d < minTargetDist) { minTargetDist = d; targetMove = m; }
              });
              nextMove = targetMove;
            } else {
              nextMove = validMoves[Math.floor(Math.random() * validMoves.length)];
            }
          }

          const finalPos = drone.pos + nextMove;
          const newBattery = Math.max(0, drone.battery - 5);
          changed = true;

          if (elapsedTime % 4 === 0) {
            addLog(
              `MCP: ${drone.label} move_to(${finalPos}). Coverage: ${Math.round((scannedCells.size / TOTAL_CELLS) * 100)}%`,
              "system"
            );
          }

          updateBatteryInDB(drone.id, newBattery);

          if (survivorSector !== null && finalPos === survivorSector && !survivorFound) {
            setSurvivorFound(true);
            setShowSurvivorDialog(true);
            addLog(`AI DETECTION: ${drone.label} confirmed survivor in Sector ${finalPos}!`, "success", true);
            return { ...drone, pos: finalPos, status: "SURVIVOR CONTACT", battery: newBattery };
          }

          return { ...drone, pos: finalPos, battery: newBattery, status: "SEARCHING" };
        });

        if (changed) {
          setScannedCells((prev) => {
            const next = new Set(prev);
            nextDrones.forEach((d) => { if (d.pos !== -1) next.add(d.pos); });
            return next;
          });
        }

        return nextDrones;
      });

      setElapsedTime((prev) => prev + 1);
    }, 1500);

    return () => clearInterval(interval);
  }, [isDeployed, isGenerating, missionComplete, survivorFound, survivorSector, elapsedTime, drones, scannedCells]);

  if (isLoading) return <LoadingOverlay />;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Survivor Dialog */}
      <AnimatePresence>
        {showSurvivorDialog && (
          <SurvivorDialog sector={survivorSector} onClose={() => setShowSurvivorDialog(false)} />
        )}
      </AnimatePresence>

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="mb-5 flex items-center justify-between gap-4 flex-shrink-0 pb-4 border-b border-slate-100">
        {/* Left: breadcrumb + title */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Link href="/events" className="hover:text-blue-600 transition-colors">
              Disaster Events
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-500">ID: EV-001</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            Sabah - Earthquake Alert
            <Badge
              variant="destructive"
              className="animate-pulse bg-red-600 px-2.5 py-0.5 text-[10px] font-black shadow-lg shadow-red-500/20"
            >
              LIVE MISSION
            </Badge>
          </h1>
        </div>

        {/* Center: scenario + deploy */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
              Scenario:
            </span>
            <div className="relative flex items-center">
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                disabled={isDeployed}
                className="appearance-none bg-transparent text-sm font-bold text-slate-800 pr-6 cursor-pointer focus:outline-none disabled:cursor-default disabled:text-slate-500"
              >
                {SCENARIOS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-0 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {!isDeployed ? (
            <Button
              onClick={handleDeploy}
              className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/25 gap-2"
            >
              <Plane className="w-4 h-4" /> Start Deployment
            </Button>
          ) : (
            <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 font-black text-[10px] px-4 py-2 rounded-xl">
              DEPLOYED
            </Badge>
          )}
        </div>

        {/* Right: location + time */}
        <div className="flex items-center gap-5 text-sm text-slate-500 font-medium flex-shrink-0">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-red-500" /> Ranau District, Malaysia
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" /> Started Just now
          </span>
        </div>
      </div>

      {/* ── Command View ─────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex gap-4">
        {/* Left Sidebar */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
          {/* Incident Reporting */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Incident Reporting
            </h3>
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
              <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
              STANDBY
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Report Event:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["🔥 Fire", "💨 Smoke", "🌍 Earthquake", "🧍 Survivor", "🌊 Flood Zone", "🏚 Collapse", "☢ Biohazard"].map((evt) => (
                <button
                  key={evt}
                  className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors border border-slate-200"
                >
                  {evt}
                </button>
              ))}
            </div>
          </div>

          {/* Sensor Telemetry */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-blue-500" /> Sensor Telemetry
            </h3>
            <div className="h-28 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-100 gap-1">
              <Thermometer className="w-6 h-6 text-slate-300" />
              <p className="text-[10px] font-bold text-slate-400">No Thermal Detections</p>
              <p className="text-[9px] text-slate-300">Run scan to populate</p>
            </div>
          </div>

          {/* Infrastructure */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">
              Infrastructure
            </h3>
            {[
              { icon: "⚡", name: "Charging Station", sub: "Power Hub" },
              { icon: "📦", name: "Supply Depot", sub: "Logistics Node" },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-2 py-1.5">
                <span className="text-base">{item.icon}</span>
                <div>
                  <p className="text-xs font-bold text-slate-700">{item.name}</p>
                  <p className="text-[10px] text-slate-400">{item.sub}</p>
                </div>
              </div>
            ))}
            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-3 mb-2">
              Sectors
            </h3>
            {["SEC-1 - SCHOOL", "SEC-2 - INDUSTRIAL", "SEC-3 - RESIDENTIAL", "SEC-4 - COMMERCIAL"].map((s) => (
              <div key={s} className="flex items-center gap-2 py-1">
                <div className="w-4 h-4 rounded-sm bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
                  <span className="text-[8px] font-black text-amber-600">i</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Toggle + View */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {/* Toggle bar */}
          <div className="flex items-center justify-between flex-shrink-0">
            <ViewToggle view={mapView} onChange={setMapView} />
            <div className="flex items-center gap-2">
              {gridLoading && (
                <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Syncing...
                </span>
              )}
              <button
                onClick={fetchGridData}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                title="Refresh grid data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <Badge className="bg-slate-900 text-white font-black text-[9px] uppercase tracking-widest px-3 py-1.5">
                Active Fleet: {gridDrones.length}
              </Badge>
            </div>
          </div>

          {/* View panel */}
          <div className="flex-1 min-h-0">
            <AnimatePresence mode="wait">
              {mapView === "grid" ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full"
                >
                  <ThreeJSGrid drones={gridDrones} entities={gridEntities as GridEntity[]} />
                </motion.div>
              ) : (
                <motion.div
                  key="live"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full"
                >
                  <MapLibreMap drones={gridDrones} entities={gridEntities as GridEntity[]} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Sidebar — Swarm Task Matrix + Live Activity Log */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
          {/* Swarm Task Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-blue-500" /> Swarm Task Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left font-black text-slate-400 pb-2 pr-2">Drone</th>
                    <th className="text-left font-black text-slate-400 pb-2 pr-2">Task</th>
                    <th className="text-left font-black text-slate-400 pb-2">Pos</th>
                  </tr>
                </thead>
                <tbody>
                  {gridDrones.length > 0
                    ? gridDrones.map((d) => (
                        <tr key={d.id} className="border-b border-slate-50">
                          <td className="py-1.5 pr-2 font-black text-blue-600">{d.name}</td>
                          <td className={cn(
                            "py-1.5 pr-2 font-bold uppercase",
                            d.status === "idle" ? "text-slate-400" : "text-emerald-600"
                          )}>
                            {d.status}
                          </td>
                          <td className="py-1.5 text-slate-500 font-mono">
                            ({Math.round(d.current_x)},{Math.round(d.current_y)})
                          </td>
                        </tr>
                      ))
                    : ["ALPHA", "BRAVO", "CHARLIE", "DELTA", "ECHO"].map((name, i) => (
                        <tr key={name} className="border-b border-slate-50">
                          <td className="py-1.5 pr-2 font-black text-blue-600">{name}</td>
                          <td className={cn("py-1.5 pr-2 font-bold uppercase", i === 4 ? "text-red-500" : "text-slate-400")}>
                            {i === 4 ? "OFFLINE" : "IDLE"}
                          </td>
                          <td className="py-1.5 text-slate-400 font-mono">(0,0)</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 text-[9px] text-slate-400 flex items-center gap-1">
              <span className="font-bold">VERSION:</span> v8.0.2
            </div>
          </div>

          {/* Active Sorties */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Active Sorties
            </h3>
            <div className="text-[10px]">
              <div className="flex justify-between py-1 border-b border-slate-100 font-black text-slate-400">
                <span>SCENARIO</span>
                <span>STATE</span>
              </div>
              <div className="flex justify-between py-2 items-center">
                <span className="font-bold text-slate-600">{scenario.toUpperCase()}</span>
                <Badge className={cn(
                  "text-[9px] font-black px-2 py-0.5",
                  isDeployed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                )}>
                  {isDeployed ? "ACTIVE" : "STANDBY"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Live Activity Log */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-blue-500" /> Live Activity Log
              <div className="ml-auto flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] text-emerald-600 font-black">LIVE</span>
              </div>
            </h3>
            <div className="h-48 overflow-y-auto space-y-1.5 pr-1">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
                  <p className="text-[10px] text-slate-400 font-medium">No mission activity recorded.</p>
                  <p className="text-[10px] text-blue-500 font-bold cursor-pointer hover:underline"
                    onClick={handleDeploy}>
                    Start deployment to begin.
                  </p>
                </div>
              ) : (
                logs.slice(-20).reverse().map((log) => (
                  <div key={log.id} className={cn(
                    "text-[9px] font-mono px-2 py-1 rounded-lg border",
                    log.type === "success" && "bg-emerald-50 border-emerald-100 text-emerald-700",
                    log.type === "warning" && "bg-amber-50 border-amber-100 text-amber-700",
                    log.type === "system" && "bg-slate-50 border-slate-100 text-slate-600",
                    log.type === "ai" && "bg-blue-50 border-blue-100 text-blue-700",
                    log.type === "info" && "bg-slate-50 border-slate-100 text-slate-600",
                  )}>
                    <span className="text-slate-400">[{log.timestamp}]</span> {log.message}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
