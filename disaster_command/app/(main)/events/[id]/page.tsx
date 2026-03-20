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
    addLog("Planning: Sector A1 has high population density. Drone Alpha-1 closest.", "ai");
    await new Promise(r => setTimeout(r, 1000));
    addLog("Decision: Assigning Alpha-1 to A1, Alpha-2 to A7, Alpha-3 to G1, Alpha-4 to G7.", "ai", true);

    // 4. Launch Drones
    const startPositions = [0, 6, 42, 48];
    setDrones(prev => prev.map((d, i) => ({
      ...d,
      pos: startPositions[i] || 0,
      status: 'SEARCHING'
    })));
    addLog("MCP: Broadasting move_to() commands. Swarm entering tactical grid.", "system");
  };

  // Movement Loop
  useEffect(() => {
    if (!isDeployed || isGenerating || survivorFound) return;

    const interval = setInterval(async () => {
      setDrones(prevDrones => {
        let changed = false;
        const nextDrones = prevDrones.map(drone => {
          if (drone.pos === -1) return drone;

          // 1. Check Battery Low - Return to Base logic
          if (drone.battery <= 10) {
            if (drone.pos !== -1) {
              addLog(`CRITICAL: ${drone.label} battery low (${drone.battery}%). Recalling to base.`, "warning", true);
              changed = true;
              return { ...drone, pos: -1, status: 'RECHARGING', battery: 100 };
            }
            return drone;
          }

          // 2. Regular Movement
          const moves = [-1, 1, -COLS, COLS];
          const validMoves = moves.filter(move => {
            const newPos = drone.pos + move;
            if (newPos < 0 || newPos >= TOTAL_CELLS) return false;
            if (move === -1 && drone.pos % COLS === 0) return false;
            if (move === 1 && (drone.pos + 1) % COLS === 0) return false;
            return true;
          });

          const nextPos = validMoves[Math.floor(Math.random() * validMoves.length)];
          const finalPos = drone.pos + nextPos;
          const newBattery = Math.max(0, drone.battery - 10);

          changed = true;

          // Log movement through MCP
          if (elapsedTime % 3 === 0) {
            addLog(`MCP: ${drone.label} move_to(${finalPos}). Battery: ${newBattery}%`, "system");
          }

          // Update DB
          updateBatteryInDB(drone.id, newBattery);

          // Check for survivor
          if (survivorSector !== null && finalPos === survivorSector && !survivorFound) {
            setSurvivorFound(true);
            addLog(`AI DETECTION: ${drone.label} confirmed survivor in Sector ${finalPos}!`, "success", true);
            return { ...drone, pos: finalPos, status: 'SURVIVOR CONTACT', battery: newBattery };
          }

          return { ...drone, pos: finalPos, battery: newBattery };
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

      // Random Survivor Trigger
      if (elapsedTime > 8 && survivorSector === null) {
        const randomSector = Math.floor(Math.random() * TOTAL_CELLS);
        setSurvivorSector(randomSector);
        addLog(`AI Reasoning: Thermal signature detected in Sector ${randomSector}. Stigmergy map updated.`, "ai", true);
      }

    }, 2000);

    return () => clearInterval(interval);
  }, [isDeployed, isGenerating, survivorFound, survivorSector, elapsedTime, drones]);

  function handleNavigate(tab: string): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      
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
    <DroneGridMap 
      rows={ROWS} 
      cols={COLS} 
      drones={drones} 
      scannedCells={scannedCells}
      hazardCells={hazardCells}
      survivorSector={survivorSector}
      survivorFound={survivorFound}
      isGenerating={isGenerating}
    />
    <MissionControlPanel 
      isDeployed={isDeployed}
      onDeploy={handleDeploy}
      logs={logs}
      onNavigate={handleNavigate}
    />
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
