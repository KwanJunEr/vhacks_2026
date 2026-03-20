"use client";

import React, { useState, useEffect, use, useRef } from "react";
import {
  MapPin,
  Terminal,
  Activity,
  Plane,
  ShieldCheck,
  Clock,
  ChevronRight,
  AlertTriangle,
  BrainCircuit,
  Waves,
  LayoutDashboard,
  LineChart,
  Network,
  Settings2,
  FileText,
  Zap,
  Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingOverlay } from "@/components/events/LoadingOverlay";
import { DroneGridMap } from "@/components/events/DroneGridMap";
import { MissionControlPanel } from "@/components/events/MissionControlPanel";
import { AITimeline } from "@/components/events/AITimeline";
import { ReasoningPanel } from "@/components/events/ReasoningPanel";
import { ConfidenceHeatmap } from "@/components/events/ConfidenceHeatmap";
import { AgentGraph } from "@/components/events/AgentGraph";
import { DroneOps } from "@/components/events/DroneOps";
import { ReportsPanel } from "@/components/events/ReportsPanel";
import { AnimatePresence, motion } from "framer-motion";
import { 
  UserRoundSearch, 
  CheckCircle2, 
  X, 
  ArrowRight,
  HeartPulse,
  Thermometer,
  Navigation
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

// Grid configuration for 7x7
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

function SurvivorDialog({ sector, onClose }: { sector: number | null, onClose: () => void }) {
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
          
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Survivor Found!</h2>
          <p className="text-slate-500 font-medium mb-8">AI analysis has confirmed a positive life sign in Sector {sector}.</p>

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
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified by Command Agent</span>
          </div>
          <span className="text-[10px] font-black text-slate-300">ID: SAR-9921</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("map");
  const [isDeployed, setIsDeployed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Simulation State
  const [scannedCells, setScannedCells] = useState<Set<number>>(new Set());
  const [hazardCells, setHazardCells] = useState<Set<number>>(new Set());
  const [survivorSector, setSurvivorSector] = useState<number | null>(null);
  const [survivorFound, setSurvivorFound] = useState(false);
  const [showSurvivorDialog, setShowSurvivorDialog] = useState(false);
  const [missionComplete, setMissionComplete] = useState(false);

  // Drones Initial State
  const [drones, setDrones] = useState<DroneState[]>([]);

  const addLog = (message: string, type: 'info' | 'warning' | 'success' | 'system' | 'ai' = 'info', showActions: boolean = false) => {
    setLogs(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        message,
        type,
        showActions,
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }
    ]);
  };

  // Fetch Drones from Supabase
  useEffect(() => {
    const fetchDrones = async () => {
      const { data, error } = await supabase
        .from('drone_fleet')
        .select('drone_name, battery')
        .limit(4);

      if (!error && data) {
        const colors = ['bg-blue-600', 'bg-indigo-600', 'bg-cyan-600', 'bg-violet-600'];
        const droneStates: DroneState[] = data.map((d, i) => ({
          id: d.drone_name,
          label: d.drone_name,
          pos: -1, // Hidden initially
          color: colors[i % colors.length],
          status: 'STANDBY',
          battery: d.battery || 100,
          targetPath: []
        }));
        setDrones(droneStates);
      }
    };
    fetchDrones();
  }, []);

  // Update battery in Supabase
  const updateBatteryInDB = async (droneName: string, battery: number) => {
    await supabase
      .from('drone_fleet')
      .update({ battery })
      .eq('drone_name', droneName);
  };

  // Initial Loading Simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Simulation Sequence
  const handleDeploy = async () => {
    setIsDeployed(true);
    setIsGenerating(true);

    // Pre-calculate survivor location for the simulation
    const randomSector = Math.floor(Math.random() * TOTAL_CELLS);
    setSurvivorSector(randomSector);
    setSurvivorFound(false);
    setShowSurvivorDialog(false);
    setMissionComplete(false);
    setScannedCells(new Set());

    // 1. Initial Discovery Logs
    addLog("Reading environmental data: Ranau Seismograph Station 14...", "system");
    await new Promise(r => setTimeout(r, 1000));
    addLog("Detected secondary tremors (Mag 3.4) in Ranau District.", "warning");
    await new Promise(r => setTimeout(r, 1000));
    addLog("Confirming sensor connectivity: 98% network stability.", "success");
    await new Promise(r => setTimeout(r, 1000));

    // 2. MCP Discovery
    addLog("MCP: Executing list_available_drones()...", "system");
    await new Promise(r => setTimeout(r, 1500));
    const droneList = drones.map(d => d.label).join(", ");
    addLog(`Discovery complete: [${droneList}] available via MCP Protocol.`, "success", true);

    // Finish Grid Generation
    await new Promise(r => setTimeout(r, 1000));
    setIsGenerating(false);

    // 3. Command Agent Planning
    addLog("Command Agent: Decomposing mission goals into tactical sectors.", "ai", true);
    await new Promise(r => setTimeout(r, 1500));
    addLog(`AI Reasoning: Identifying high-probability search zone in Sector ${randomSector} via thermal anomaly.`, "ai");
    await new Promise(r => setTimeout(r, 1000));
    addLog("Decision: Assigning Alpha-1 to A1, Alpha-2 to A7, Alpha-3 to G1, Alpha-4 to G7.", "ai", true);

    // 4. Launch Drones
    const startPositions = [0, 6, 42, 48];
    setDrones(prev => prev.map((d, i) => ({
      ...d,
      pos: startPositions[i] || 0,
      status: 'SEARCHING',
      battery: 100
    })));
    addLog("MCP: Broadasting move_to() commands. Swarm entering tactical grid.", "system");
  };

  // Movement Loop
  useEffect(() => {
    if (!isDeployed || isGenerating || missionComplete) return;

    const interval = setInterval(async () => {
      // 0. Check for Mission Completion
      if (scannedCells.size === TOTAL_CELLS) {
        setMissionComplete(true);
        addLog("MISSION COMPLETE: 100% tactical grid coverage achieved.", "success", true);
        return;
      }

      setDrones(prevDrones => {
        let changed = false;
        const nextDrones = prevDrones.map(drone => {
          if (drone.pos === -1) return drone;

          // 1. Check Battery Low - Return to Base logic
          if (drone.battery <= 15 || drone.status === 'RECHARGING') {
            if (drone.status === 'RECHARGING') {
              // Simulate recharge time (redeploy when battery reaches 100)
              const rechargedBattery = Math.min(100, (drone.battery || 0) + 20);
              if (rechargedBattery === 100) {
                const droneIdx = prevDrones.indexOf(drone);
                const startPos = [0, 6, 42, 48][droneIdx] || 0;
                addLog(`${drone.label}: RECHARGE COMPLETE. Signal established. Redeploying to search grid via Sector ${startPos}.`, "success", true);
                return { ...drone, pos: startPos, status: 'SEARCHING', battery: 100 };
              }
              return { ...drone, battery: rechargedBattery };
            }

            if (drone.pos !== -1) {
              addLog(`CRITICAL: ${drone.label} battery at ${drone.battery}%. Initiating RTH (Return to Home) protocol.`, "warning", true);
              changed = true;
              return { ...drone, pos: -1, status: 'RECHARGING' };
            }
            return drone;
          }

          // 2. Regular Movement with Stigmergy (Prioritize unscanned)
          const moves = [-1, 1, -COLS, COLS];
          const validMoves = moves.filter(move => {
            const newPos = drone.pos + move;
            if (newPos < 0 || newPos >= TOTAL_CELLS) return false;
            if (move === -1 && drone.pos % COLS === 0) return false;
            if (move === 1 && (drone.pos + 1) % COLS === 0) return false;
            return true;
          });

          // Prioritize unscanned neighbors
          const unscannedMoves = validMoves.filter(m => !scannedCells.has(drone.pos + m));
          
          // SPECIAL LOGIC: Attraction to survivor if within range (Manhattan distance <= 2)
          let nextMove;
          const droneRow = Math.floor(drone.pos / COLS);
          const droneCol = drone.pos % COLS;
          const survivorRow = Math.floor((survivorSector || 0) / COLS);
          const survivorCol = (survivorSector || 0) % COLS;
          const distToSurvivor = Math.abs(droneRow - survivorRow) + Math.abs(droneCol - survivorCol);

          if (survivorSector !== null && !survivorFound && distToSurvivor <= 2) {
            nextMove = validMoves.find(m => {
              const newPos = drone.pos + m;
              const newDist = Math.abs(Math.floor(newPos / COLS) - survivorRow) + Math.abs((newPos % COLS) - survivorCol);
              return newDist < distToSurvivor;
            });
          }
          
          // If no survivor attraction, try unscanned neighbors
          if (!nextMove && unscannedMoves.length > 0) {
            nextMove = unscannedMoves[Math.floor(Math.random() * unscannedMoves.length)];
          }

          // If still no move (surrounded by scanned cells), move towards the closest unscanned cell
          if (!nextMove) {
            let minTargetDist = Infinity;
            let targetMove = validMoves[0];

            // Find all unscanned cells
            const unscannedCellsArr = Array.from({ length: TOTAL_CELLS })
              .map((_, i) => i)
              .filter(i => !scannedCells.has(i));

            if (unscannedCellsArr.length > 0) {
              // Move towards the first unscanned cell found (simple but effective for systematic coverage)
              const targetCell = unscannedCellsArr[0];
              const tRow = Math.floor(targetCell / COLS);
              const tCol = targetCell % COLS;

              validMoves.forEach(m => {
                const newPos = drone.pos + m;
                const d = Math.abs(Math.floor(newPos / COLS) - tRow) + Math.abs((newPos % COLS) - tCol);
                if (d < minTargetDist) {
                  minTargetDist = d;
                  targetMove = m;
                }
              });
              nextMove = targetMove;
            } else {
              nextMove = validMoves[Math.floor(Math.random() * validMoves.length)];
            }
          }

          const finalPos = drone.pos + nextMove;
          const newBattery = Math.max(0, drone.battery - 5); 

          changed = true;

          // Log movement through MCP
          if (elapsedTime % 4 === 0) {
            addLog(`MCP: ${drone.label} move_to(${finalPos}). Coverage: ${Math.round((scannedCells.size / TOTAL_CELLS) * 100)}%`, "system");
          }

          // Update DB (Simulated)
          updateBatteryInDB(drone.id, newBattery);

          // Check for survivor
          if (survivorSector !== null && finalPos === survivorSector && !survivorFound) {
            setSurvivorFound(true);
            setShowSurvivorDialog(true);
            addLog(`AI DETECTION: ${drone.label} confirmed survivor in Sector ${finalPos}!`, "success", true);
            return { ...drone, pos: finalPos, status: 'SURVIVOR CONTACT', battery: newBattery };
          }

          return { ...drone, pos: finalPos, battery: newBattery, status: 'SEARCHING' };
        });

        if (changed) {
          // Update Scanned Map (Stigmergy)
          setScannedCells(prev => {
            const next = new Set(prev);
            nextDrones.forEach(d => { if(d.pos !== -1) next.add(d.pos); });
            return next;
          });
        }

        return nextDrones;
      });

      setElapsedTime(prev => prev + 1);
    }, 1500);

    return () => clearInterval(interval);
  }, [isDeployed, isGenerating, missionComplete, survivorFound, survivorSector, elapsedTime, drones, scannedCells]);

  function handleNavigate(tab: string): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      
      {/* Survivor Found Dialog */}
      <AnimatePresence>
        {showSurvivorDialog && (
          <SurvivorDialog 
            sector={survivorSector} 
            onClose={() => setShowSurvivorDialog(false)} 
          />
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Link href="/events" className="hover:text-blue-600 transition-colors">Disaster Events</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-500">ID: EV-001</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            Sabah - Earthquake Alert
            <Badge variant="destructive" className="animate-pulse bg-red-600 px-3 py-1 font-bold shadow-lg shadow-red-500/20">
              LIVE MISSION
            </Badge>
          </h1>
          <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-red-500" /> Ranau District, Malaysia</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> Started Just now</span>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="map" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100 border border-slate-200 p-1 self-start mb-6 shadow-sm overflow-x-auto max-w-full no-scrollbar">
          <TabsTrigger value="map" className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-tight transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md">
            <MapPin className="w-3.5 h-3.5" /> Live Map
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-tight transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md">
            <Terminal className="w-3.5 h-3.5" /> AI Timeline
          </TabsTrigger>
          <TabsTrigger value="reasoning" className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-tight transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md">
            <BrainCircuit className="w-3.5 h-3.5" /> Reasoning
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-tight transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md">
            <LayoutDashboard className="w-3.5 h-3.5" /> Heatmap
          </TabsTrigger>
          <TabsTrigger value="graph" className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-tight transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md">
            <Network className="w-3.5 h-3.5" /> Agent Graph
          </TabsTrigger>
          <TabsTrigger value="ops" className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-tight transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md">
            <Settings2 className="w-3.5 h-3.5" /> Drone Ops
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-tight transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md">
            <FileText className="w-3.5 h-3.5" /> Reports
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 relative glass-panel rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm flex flex-col">
          <AnimatePresence>
            {isLoading && <LoadingOverlay key="loading" />}
          </AnimatePresence>

         <TabsContent value="map" className="flex-1 m-0 focus-visible:outline-none h-full overflow-hidden">
  <div className="flex flex-col md:flex-row h-full max-h-full items-stretch overflow-hidden">
    <div className="flex-1 min-h-0 h-full">
      <DroneGridMap 
        rows={ROWS} 
        cols={COLS} 
        drones={drones} 
        scannedCells={scannedCells}
        hazardCells={hazardCells}
        survivorSector={survivorSector}
        survivorFound={survivorFound}
        isGenerating={isGenerating}
        missionComplete={missionComplete}
      />
    </div>
    <div className="w-full md:w-96 shrink-0 h-full border-l border-slate-200">
      <MissionControlPanel 
        isDeployed={isDeployed}
        onDeploy={handleDeploy}
        logs={logs}
        onNavigate={handleNavigate}
      />
    </div>
  </div>
</TabsContent>

          <TabsContent value="timeline" className="flex-1 m-0 focus-visible:outline-none">
            <AITimeline />
          </TabsContent>
          <TabsContent value="reasoning" className="flex-1 m-0 focus-visible:outline-none">
            <ReasoningPanel />
          </TabsContent>
          <TabsContent value="heatmap" className="flex-1 m-0 focus-visible:outline-none">
            <ConfidenceHeatmap scannedCells={scannedCells} survivorSector={survivorSector} survivorFound={survivorFound} />
          </TabsContent>
          <TabsContent value="graph" className="flex-1 m-0 focus-visible:outline-none">
            <AgentGraph />
          </TabsContent>
          <TabsContent value="ops" className="flex-1 m-0 focus-visible:outline-none">
            <DroneOps drones={drones} />
          </TabsContent>
          <TabsContent value="reports" className="flex-1 m-0 focus-visible:outline-none overflow-y-auto">
            <ReportsPanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
