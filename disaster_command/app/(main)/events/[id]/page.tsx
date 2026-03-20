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

// Grid configuration for 7x7
const ROWS = 7;
const COLS = 7;
const TOTAL_CELLS = ROWS * COLS;

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("map");
  const [isDeployed, setIsDeployed] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Simulation State
  const [scannedCells, setScannedCells] = useState<Set<number>>(new Set());
  const [hazardCells, setHazardCells] = useState<Set<number>>(new Set());
  const [survivorSector, setSurvivorSector] = useState<number | null>(null);
  const [survivorFound, setSurvivorFound] = useState(false);
  
  // Drones Initial State
  const [drones, setDrones] = useState([
    { id: 1, label: 'Alpha-1', pos: 0, color: 'bg-blue-600', status: 'Scanning' },
    { id: 2, label: 'Alpha-2', pos: 6, color: 'bg-indigo-600', status: 'Scanning' },
    { id: 3, label: 'Alpha-3', pos: 42, color: 'bg-cyan-600', status: 'Scanning' },
  ]);

  const addLog = (message: string, type: 'info' | 'warning' | 'success' | 'system' = 'info') => {
    setLogs(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        message,
        type,
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }
    ]);
  };

  // Initial Loading Simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Deployment Logic
  const handleDeploy = () => {
    setIsDeployed(true);
    addLog("Initiating mission deployment sequence...", "system");
    
    // Deployment Steps
    setTimeout(() => addLog("Reading environmental data: Ranau Seismograph Station 14...", "info"), 1000);
    setTimeout(() => addLog("Detected secondary tremors (Mag 3.4) in Ranau District.", "warning"), 2000);
    setTimeout(() => addLog("Confirming sensor connectivity: 98% network stability.", "success"), 3000);
    setTimeout(() => addLog("Drone Fleet Alpha-1: Launched and entering grid.", "info"), 4000);
    setTimeout(() => addLog("Scanning terrain for structural anomalies...", "info"), 5000);
  };

  // Simulation Loop
  useEffect(() => {
    if (!isDeployed || activeTab !== 'map' || survivorFound) return;

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);

      // Survivor trigger after some time
      if (elapsedTime > 15 && survivorSector === null) {
        setSurvivorSector(Math.floor(Math.random() * TOTAL_CELLS));
        addLog("AI Detection: Heat signature anomaly detected in Sector " + Math.floor(Math.random() * TOTAL_CELLS), "warning");
      }

      // Move Drones
      setDrones(prevDrones => prevDrones.map(drone => {
        // Random Walk Logic
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

        // Check for survivor
        if (survivorSector !== null && finalPos === survivorSector && !survivorFound) {
          setSurvivorFound(true);
          addLog("CRITICAL: Survivor found in Sector " + survivorSector + "!", "success");
          return { ...drone, pos: finalPos, status: 'SURVIVOR CONTACT' };
        }

        return { ...drone, pos: finalPos };
      }));

      // Update Scanned Map
      setScannedCells(prev => {
        const next = new Set(prev);
        drones.forEach(d => next.add(d.pos));
        return next;
      });

    }, 1000);

    return () => clearInterval(interval);
  }, [isDeployed, activeTab, drones, survivorFound, survivorSector, elapsedTime]);

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

          <TabsContent value="map" className="flex-1 m-0 focus-visible:outline-none">
            <div className="flex flex-col md:flex-row h-full">
              <DroneGridMap 
                rows={ROWS} 
                cols={COLS} 
                drones={drones} 
                scannedCells={scannedCells}
                hazardCells={hazardCells}
                survivorSector={survivorSector}
                survivorFound={survivorFound}
              />
              <MissionControlPanel 
                isDeployed={isDeployed}
                onDeploy={handleDeploy}
                logs={logs}
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
            <ConfidenceHeatmap />
          </TabsContent>
          <TabsContent value="graph" className="flex-1 m-0 focus-visible:outline-none">
            <AgentGraph />
          </TabsContent>
          <TabsContent value="ops" className="flex-1 m-0 focus-visible:outline-none">
            <DroneOps />
          </TabsContent>
          <TabsContent value="reports" className="flex-1 m-0 focus-visible:outline-none overflow-y-auto">
            <ReportsPanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
