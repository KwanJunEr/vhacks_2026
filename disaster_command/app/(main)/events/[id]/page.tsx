"use client";

import React, { useState, use, useEffect, useRef } from "react";
import { 
  MapPin, 
  Crosshair, 
  MessageSquare, 
  Terminal, 
  Activity, 
  Wifi, 
  Battery, 
  Cpu, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Move, 
  User, 
  Siren, 
  Timer, 
  ArrowRight, 
  BrainCircuit,
  Plane,
  XCircle,
  ShieldCheck,
  RefreshCw,
  FileText,
  BarChart3,
  TrendingUp,
  Clock,
  Download,
  DollarSign,
  Users,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

// Grid configuration for 7x7 (as requested)
const ROWS = 7;
const COLS = 7;
const TOTAL_CELLS = ROWS * COLS;

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrapping params for Next.js 15+
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState("map");
  
  // Simulation State
  const [scannedCells, setScannedCells] = useState<Set<number>>(new Set());
  const [hazardCells, setHazardCells] = useState<Set<number>>(new Set());
  
  // Drones Initial State (Adjusted for 7x7 grid: indices 0-48)
  const [drones, setDrones] = useState([
    { id: 1, label: 'Alpha', pos: 0, color: 'bg-blue-500', status: 'Scanning', type: 'Scout' },
    { id: 2, label: 'Beta', pos: 6, color: 'bg-indigo-500', status: 'Scanning', type: 'Scout' },
    { id: 3, label: 'Charlie', pos: 42, color: 'bg-cyan-500', status: 'Scanning', type: 'Heavy' },
    { id: 4, label: 'Delta', pos: 48, color: 'bg-slate-500', status: 'Standby', type: 'Relay' }, // Extra drone for coordination demo
  ]);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Survivor / Event Logic
  const [survivorSector, setSurvivorSector] = useState<null | number>(null);
  const [survivorFound, setSurvivorFound] = useState(false);
  const [aiAnalysisStep, setAiAnalysisStep] = useState(0);
  
  // Ref for one-time trigger
  const hasTriggeredSurvivor = useRef(false);

  // Simulation Loop
  useEffect(() => {
    // If we are in "Agent" view and survivor is found, animate the reasoning steps
    if (activeTab === 'agent' && survivorFound) {
       if (aiAnalysisStep < 5) {
          const timer = setTimeout(() => {
             setAiAnalysisStep(prev => prev + 1);
          }, 800); 
          return () => clearTimeout(timer);
       }
       return;
    }

    // Only run movement loop on Map tab
    if (activeTab !== 'map') return;

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);

      // --- SURVIVOR TRIGGER LOGIC (Accelerated Timeline) ---
      // Trigger after ~5 seconds in map view
      if (!hasTriggeredSurvivor.current && elapsedTime > 6) { 
         hasTriggeredSurvivor.current = true;
         // Spawn survivor in front of Drone 1 (Alpha)
         // Drone 1 starts at 0, likely around index 5-10 by now
         const targetDrone = drones[0]; 
         let targetSector = targetDrone.pos + 1;
         
         // Boundary check
         if (targetSector >= TOTAL_CELLS) targetSector = TOTAL_CELLS - 2;
         
         setSurvivorSector(targetSector);
      }

      // Move Drones
      setDrones(prevDrones => prevDrones.map(drone => {
        // Drone 4 (Delta) stays in standby/charging until coordination phase
        if (drone.label === 'Delta') return drone;

        // If survivor found, freeze or move to specific spots?
        // For this demo: freeze on discovery to show the "Found" state clearly
        if (survivorFound) return drone;

        // Check for survivor discovery
        if (survivorSector !== null && drone.pos === survivorSector && !survivorFound) {
           setSurvivorFound(true); 
           // Dramatic pause then switch to Drones (next in sequence)
           setTimeout(() => setActiveTab('drones'), 800); 
           return { ...drone, status: 'SURVIVOR CONTACT' };
        }

        // Random Walk Logic (valid neighbors)
        const moves = [-1, 1, -COLS, COLS]; 
        const validMoves = moves.filter(move => {
          const newPos = drone.pos + move;
          if (newPos < 0 || newPos >= TOTAL_CELLS) return false;
          // Wrap checks
          if (move === -1 && drone.pos % COLS === 0) return false;
          if (move === 1 && (drone.pos + 1) % COLS === 0) return false;
          return true;
        });
        
        // Prefer unscanned cells to simulate "intelligence"
        const preferredMoves = validMoves.filter(m => !scannedCells.has(drone.pos + m));
        const finalMove = preferredMoves.length > 0 
          ? preferredMoves[Math.floor(Math.random() * preferredMoves.length)]
          : validMoves[Math.floor(Math.random() * validMoves.length)];

        return { ...drone, pos: drone.pos + finalMove };
      }));

      // Update Scanned Map
      setScannedCells(prev => {
        const next = new Set(prev);
        drones.forEach(d => {
           if (d.label !== 'Delta') next.add(d.pos);
        });
        return next;
      });

      // Spawn Hazards (only if no survivor yet)
      if (Math.random() < 0.05 && !survivorFound) {
        const hazardPos = Math.floor(Math.random() * TOTAL_CELLS);
        if (hazardPos !== survivorSector) {
           setHazardCells(prev => new Set(prev).add(hazardPos));
        }
      }

    }, 800); 

    return () => clearInterval(interval);
  }, [activeTab, drones, scannedCells, elapsedTime, survivorFound, survivorSector, aiAnalysisStep, id]);


  const aiSteps = [
     { label: "Disaster analysis", confidence: 100 },
     { label: "Fleet assessment", confidence: 95 },
     { label: "Sector prioritization", confidence: 92 },
     { label: "Battery optimization", confidence: 98 },
     { label: "Generating New Flight Path...", confidence: 99, highlight: true }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 text-sm text-slate-500 mb-1 font-medium">
             <span>Disaster Events</span>
             <span>/</span>
             <span className="text-slate-400">REF-{id.padStart(3, '0')}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Typhoon Warning - Manila sector
            <span className={cn(
               "px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide border shadow-sm transition-all duration-500",
               survivorFound 
                 ? "bg-amber-100 text-amber-700 border-amber-300 animate-pulse"
                 : "bg-red-50 text-red-600 border-red-200"
            )}>
               {survivorFound ? "CRITICAL ALERT: SURVIVOR" : "LIVE OPERATIONS"}
            </span>
          </h1>
        </div>
        <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-1 shadow-inner">
           {[
             { id: 'map', label: 'Live Map', icon: MapPin },
             { id: 'drones', label: 'Drone Coordination', icon: Plane },
             { id: 'agent', label: 'Agent Panel', icon: BrainCircuit },
             { id: 'logs', label: 'MCP Logs', icon: Terminal },
           ].map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-300",
                  activeTab === tab.id 
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50',
                  
                  // Flash animations for guiding the user/judges
                  tab.id === 'drones' && survivorFound && activeTab === 'map' && "animate-bounce bg-amber-100 text-amber-700 font-bold",
                  tab.id === 'agent' && survivorFound && activeTab === 'drones' && "animate-pulse bg-blue-100 text-blue-700"
               )}
             >
               <tab.icon className="w-4 h-4" />
               <span className="hidden sm:inline">{tab.label}</span>
             </button>
           ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 glass-panel rounded-xl overflow-hidden border border-slate-200 relative bg-white shadow-sm flex flex-col">
        
        {/* Tab Content: MAP */}
        {activeTab === 'map' && (
          <div className="w-full h-full flex flex-col md:flex-row">
            {/* Interactive Grid Map */}
            <div className="flex-1 bg-slate-50/50 relative overflow-hidden flex items-center justify-center p-8">
               
               {/* Background Grid Lines */}
               <div className="absolute inset-0 pointer-events-none" 
                    style={{ 
                       backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
                       backgroundSize: '24px 24px'
                    }} 
               />

               {/* The Grid Container (7x7) */}
               <div 
                 className="relative bg-white shadow-2xl rounded-xl border border-slate-200 overflow-hidden"
                 style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
                    width: 'min(100%, 500px)', // Slightly smaller for 7x7 to look nice
                    aspectRatio: '1/1',
                 }}
               >
                  {/* Grid Cells */}
                  {Array.from({ length: TOTAL_CELLS }).map((_, i) => {
                     const isScanned = scannedCells.has(i);
                     const isHazard = hazardCells.has(i);
                     const activeDrone = drones.find(d => d.pos === i && d.label !== 'Delta'); // Hide Delta on map
                     const isSurvivor = survivorSector === i;
                     const showSurvivor = isSurvivor && (hasTriggeredSurvivor.current); 

                     return (
                        <div 
                           key={i} 
                           className={cn(
                              "border-[0.5px] border-slate-100 transition-all duration-700 relative group flex items-center justify-center",
                              isHazard ? "bg-red-500/20 border-red-500/30" :
                              showSurvivor ? "bg-amber-400/30 border-amber-500/50 animate-pulse" :
                              isScanned ? "bg-blue-500/10 border-blue-500/20" : 
                              "bg-transparent hover:bg-slate-50"
                           )}
                           title={`Sector ${i}`}
                        >
                           {/* Drone Icon */}
                           {activeDrone && (
                              <div className="absolute inset-0 flex items-center justify-center z-20">
                                 <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform duration-500", activeDrone.color)}>
                                     <Crosshair className="w-5 h-5 text-white animate-spin-slow" />
                                 </div>
                                 <div className={cn("absolute inset-0 rounded-full animate-ping opacity-75", activeDrone.color)} />
                              </div>
                           )}

                           {/* Survivor */}
                           {showSurvivor && !activeDrone && (
                              <div className="absolute inset-0 flex items-center justify-center z-30 animate-bounce">
                                 <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-amber-300">
                                     <User className="w-6 h-6 text-white" />
                                 </div>
                              </div>
                           )}

                           {/* Hazard */}
                           {isHazard && !activeDrone && !showSurvivor && (
                              <div className="absolute inset-0 flex items-center justify-center animate-pulse z-10">
                                 <AlertTriangle className="w-6 h-6 text-red-600 drop-shadow-sm" />
                              </div>
                           )}
                           
                           {/* Scanned Checkmark */}
                           {isScanned && !activeDrone && !isHazard && !showSurvivor && (
                              <div className="opacity-20">
                                 <CheckCircle2 className="w-4 h-4 text-blue-600" />
                              </div>
                           )}
                        </div>
                     );
                  })}
               </div>
            </div>

            {/* Sidebar Controls / Info */}
            <div className="w-full md:w-80 border-l border-slate-200 bg-white p-6 overflow-y-auto">
               <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" /> Mission Status
               </h3>

               <div className="space-y-6">
                  {/* Progress Stats */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                     <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-slate-500">Coverage (7x7 Grid)</span>
                        <span className="text-2xl font-bold text-slate-900">{Math.round((scannedCells.size / TOTAL_CELLS) * 100)}%</span>
                     </div>
                     <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                           className="h-full bg-blue-600 transition-all duration-500"
                           style={{ width: `${(scannedCells.size / TOTAL_CELLS) * 100}%` }}
                        />
                     </div>
                  </div>

                  {/* Active Units */}
                  <div>
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Deployed Units</h4>
                     <div className="space-y-3">
                        {drones.filter(d => d.label !== 'Delta').map((drone) => (
                           <div key={drone.id} className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                              <div className={cn("w-2 h-2 rounded-full animate-pulse", drone.color.replace('bg-', 'bg-'))} />
                              <div className="flex-1">
                                 <div className="text-sm font-semibold text-slate-900">Unit-{drone.label}</div>
                                 <div className="text-xs text-slate-500">{drone.type} • Sector {drone.pos}</div>
                              </div>
                              <div className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded">ACTIVE</div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Tab Content: DRONE COORDINATION (The Logic Change) */}
        {activeTab === 'drones' && (
           <div className="flex-1 bg-slate-50/50 p-8 flex flex-col overflow-y-auto">
              
              <div className="mb-8 flex items-end justify-between">
                 <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                       <Plane className="w-6 h-6 text-blue-600" /> 
                       Fleet Coordination
                    </h2>
                    <p className="text-slate-500">Real-time resource allocation and tasking.</p>
                 </div>
                 
                 {/* Comparison Badge */}
                 {survivorFound && (
                    <div className="bg-emerald-100 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-lg font-mono text-sm shadow-sm flex items-center gap-2 animate-in slide-in-from-right">
                       <BrainCircuit className="w-4 h-4" />
                       GEMINI SWARM OPTIMIZED
                    </div>
                 )}
              </div>

              {/* Strategy Comparison Card */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                 
                 {/* Manual / Old Way */}
                 <div className="bg-slate-100 border border-slate-200 rounded-xl p-6 opacity-60 grayscale-[50%]">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-600 flex items-center gap-2">
                           <User className="w-4 h-4" /> Standard Protocol (Manual)
                        </h3>
                        <span className="text-xs bg-slate-200 px-2 py-1 rounded text-slate-500">INEFFICIENT</span>
                     </div>
                     <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white rounded border border-slate-200">
                           <Crosshair className="w-4 h-4 text-slate-400" />
                           <div className="text-sm">
                              <span className="font-semibold block text-slate-700">All Units</span>
                              <span className="text-slate-500">Continue grid scanning pattern (Default)</span>
                           </div>
                        </div>
                        <div className="text-xs text-red-500 font-medium flex items-center gap-1 mt-2">
                           <XCircle className="w-3 h-3" /> Redundancy high, survivor prioritization low.
                        </div>
                     </div>
                 </div>

                 {/* AI / New Way */}
                 <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-xl ring-1 ring-blue-100 relative overflow-hidden">
                     {/* Shine effect */}
                     <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

                     <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-blue-700 flex items-center gap-2">
                           <BrainCircuit className="w-4 h-4" /> Gemini Logic (Active)
                        </h3>
                        <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded animate-pulse">OPTIMIZED</span>
                     </div>
                     
                     <div className="space-y-3 relative z-10">
                        <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded border border-blue-100">
                           <div className="w-2 h-2 bg-blue-500 rounded-full" />
                           <div className="text-sm flex-1">
                              <span className="font-semibold block text-slate-800">Unit Alpha & Beta</span>
                              <span className="text-slate-600">Converge on survivor (Rescue + Support)</span>
                           </div>
                           <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded border border-blue-100">
                           <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                           <div className="text-sm flex-1">
                              <span className="font-semibold block text-slate-800">Unit Charlie</span>
                              <span className="text-slate-600">Maintain search pattern (Grid Coverage)</span>
                           </div>
                           <Activity className="w-4 h-4 text-blue-500" />
                        </div>
                     </div>
                 </div>
              </div>

              {/* Detailed Drone Status Grid */}
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Fleet Telemetry</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 {[
                    { drone: drones[0], role: "Primary Rescue", action: "Holding Position", icon: Siren, statusColor: "text-amber-600 bg-amber-50 border-amber-200" },
                    { drone: drones[1], role: "Medical Support", action: "En Route to Target", icon: CheckCircle2, statusColor: "text-blue-600 bg-blue-50 border-blue-200" },
                    { drone: drones[2], role: "Area Scan", action: "Resuming Search", icon: Move, statusColor: "text-emerald-600 bg-emerald-50 border-emerald-200" },
                    { drone: drones[3], role: "Relay Node", action: "Return to Charger", icon: Zap, statusColor: "text-slate-500 bg-slate-100 border-slate-200" },
                 ].map((item, idx) => (
                    <div key={idx} className={cn("bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-all", survivorFound ? item.statusColor : "border-slate-200")}>
                       <div className="flex justify-between items-start mb-4">
                          <div className="flex flex-col">
                             <span className="text-xs font-bold uppercase opacity-70 mb-1">{item.drone.type} Class</span>
                             <span className="text-lg font-bold text-slate-900">Unit {item.drone.label}</span>
                          </div>
                          <div className={cn("p-2 rounded-lg bg-white/50 backdrop-blur-sm shadow-sm")}>
                             <item.icon className="w-5 h-5" />
                          </div>
                       </div>
                       
                       <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                             <span className="text-slate-500">Task</span>
                             <span className="font-medium text-slate-800">{survivorFound ? item.role : "Patrol"}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                             <span className="text-slate-500">Status</span>
                             <span className="font-medium text-slate-800">{survivorFound ? item.action : "Scanning..."}</span>
                          </div>
                          <div className="mt-3 pt-3 border-t border-black/5 flex items-center gap-2 text-xs font-mono opacity-80">
                             <Battery className="w-3 h-3" />
                             <span>{Math.floor(90 - (idx * 12))}% Battery</span>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>

           </div>
        )}

        {/* Tab Content: AGENT (Reasoning) */}
        {activeTab === 'agent' && (
           <div className="flex h-full flex-col md:flex-row bg-slate-50/30">
              <div className="w-full md:w-80 border-r border-slate-200 bg-white p-6 flex flex-col h-full">
                 <div className="mb-6">
                    <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
                       <BrainCircuit className="w-6 h-6" />
                       <span>Gemini Command Agent</span>
                    </div>
                    <p className="text-sm text-slate-500"> Autonomous mission planning and resource allocation system.</p>
                 </div>
                 {survivorFound && (
                    <div className="mt-auto mb-6 p-4 bg-slate-900 rounded-xl text-white shadow-xl animate-in slide-in-from-bottom duration-1000">
                       <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
                          <span className="text-xs font-mono text-slate-400 uppercase">Replan Speed</span>
                          <Zap className="w-4 h-4 text-yellow-400" />
                       </div>
                       <div className="space-y-4">
                          <div>
                             <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-300">Human Operator</span>
                                <span className="text-slate-500">5:00+ min</span>
                             </div>
                             <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-slate-500 w-[5%]" />
                             </div>
                          </div>
                          <div>
                             <div className="flex justify-between text-sm mb-1 font-bold">
                                <span className="text-blue-200">Gemini Agent</span>
                                <span className="text-emerald-400">2.3 sec</span>
                             </div>
                             <div className="h-2 bg-slate-700 rounded-full overflow-hidden relative">
                                <div className="h-full bg-emerald-500 w-[95%] animate-pulse absolute left-0 top-0" />
                             </div>
                          </div>
                       </div>
                    </div>
                 )}
              </div>
              <div className="flex-1 p-8 overflow-y-auto">
                 {survivorFound ? (
                     <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-6 animate-in zoom-in duration-500">
                        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center border-4 border-white shadow-md animate-bounce">
                           <Siren className="w-8 h-8 text-amber-600" />
                        </div>
                        <div>
                           <h2 className="text-2xl font-bold text-amber-900 mb-1">SURVIVOR DETECTED</h2>
                           <p className="text-amber-700 flex items-center gap-2">
                              <MapPin className="w-4 h-4" /> 
                              Sector {survivorSector} identified. Initiating rescue protocol.
                           </p>
                        </div>
                        <div className="ml-auto flex flex-col items-end">
                           <span className="text-xs font-bold uppercase text-amber-400">Confidence</span>
                           <span className="text-3xl font-black text-amber-600">99.9%</span>
                        </div>
                     </div>
                 ) : (
                    <div className="mb-8 p-6 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-4 opacity-50">
                       <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                          <Activity className="w-6 h-6 text-slate-400" />
                       </div>
                       <div>
                          <h2 className="text-lg font-bold text-slate-700">System Standby</h2>
                          <p className="text-slate-500">Waiting for trigger events...</p>
                       </div>
                    </div>
                 )}
                 {survivorFound && (
                    <div className="space-y-4 max-w-2xl">
                       <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Terminal className="w-4 h-4" /> 
                          Real-time reasoning trace
                       </h3>
                       {aiSteps.map((step, index) => (
                          <div 
                             key={index}
                             className={cn(
                                "flex items-center gap-4 p-4 rounded-lg border shadow-sm transition-all duration-500",
                                index <= aiAnalysisStep 
                                   ? "opacity-100 translate-x-0" 
                                   : "opacity-0 -translate-x-4",
                                step.highlight 
                                   ? "bg-blue-600 border-blue-600 text-white" 
                                   : "bg-white border-slate-100 text-slate-800"
                             )}
                             style={{ transitionDelay: `${index * 150}ms` }}
                          >
                               <div className={cn(
                                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border",
                                  step.highlight ? "bg-white/20 border-white/30 text-white" : "bg-slate-50 border-slate-200 text-slate-500"
                               )}>
                                  {index + 1}
                               </div>
                               <div className="flex-1 font-medium">
                                  {step.label}
                               </div>
                               {index <= aiAnalysisStep && (
                                  <div className={cn(
                                     "text-xs font-mono px-2 py-1 rounded",
                                     step.highlight ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-600"
                                   )}>
                                     {step.confidence}% Correct
                                  </div>
                               )}
                               {index > aiAnalysisStep && (
                                  <div className="w-4 h-4 rounded-full border-2 border-slate-200 border-t-slate-400 animate-spin" />
                               )}
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>
        )}

        {/* Tab Content: MCP LOGS */}
        {activeTab === 'logs' && (
           <div className="flex-1 bg-slate-900 p-8 overflow-y-auto font-mono text-sm relative">
              <div className="absolute top-4 right-4 flex items-center gap-2 text-slate-500 text-xs uppercase tracking-widest">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 Live Connection
              </div>
              
              <h2 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-3">
                 <Terminal className="w-5 h-5 text-emerald-500" /> 
                 System Audit Log
              </h2>

              <div className="space-y-1">
                 {[
                    { time: "14:30:15", unit: "Drone_A", action: "moved to Sector B1", status: "success" },
                    { time: "14:30:18", unit: "Drone_A", action: "scanned sector (45 thermal points found)", status: "success" },
                    { time: "14:30:23", unit: "Drone_B", action: "scanned Sector A2 (67 points found)", status: "success" },
                    { time: "14:30:30", unit: "Drone_A", action: "moved to Sector B2", status: "success" },
                    { time: "14:30:35", unit: "Drone_C", action: "scanned Sector C1 (12 thermal points found)", status: "success" },
                    { time: "14:30:42", unit: "Drone_B", action: "Battery check (82%) - Optimal", status: "info" },
                    { time: "14:30:50", unit: "AI_CORE", action: "SURVIVOR DETECTED in B2 (confidence: 0.95)", status: "critical" },
                    { time: "14:30:50", unit: "Mission", action: "Status update: RESCUE PROTOCOL INITIATED", status: "critical" },
                    { time: "14:30:52", unit: "Drone_B", action: "Redirected to B2 for backup support", status: "success" },
                    { time: "14:30:55", unit: "NetLink", action: "Uploaded imagery to HQ (15MB)", status: "success" },
                    { time: "14:31:00", unit: "Drone_A", action: "Hovering at 15m - awaiting ground team", status: "warning" },
                 ].map((log, i) => (
                    <div 
                       key={i} 
                       className={cn(
                          "flex items-start gap-4 p-2 rounded hover:bg-white/5 border-l-2 pl-4 transition-all duration-300",
                          log.status === "critical" ? "border-amber-500 bg-amber-500/10 text-amber-200" :
                          log.status === "warning" ? "border-yellow-500 text-yellow-200" :
                          log.status === "info" ? "border-blue-500 text-blue-200" :
                          "border-emerald-500 text-slate-300"
                       )}
                       style={{ animationDelay: `${i * 100}ms` }}
                    >
                       <span className="text-slate-500 select-none">{log.time}</span>
                       <span className={cn("font-bold w-24", log.unit === "AI_CORE" ? "text-purple-400" : "text-blue-400")}>{log.unit}</span>
                       <span className="flex-1">{log.action}</span>
                       {log.status === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                       {log.status === "critical" && <Siren className="w-4 h-4 text-amber-500 animate-pulse" />}
                       {log.status === "warning" && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                    </div>
                 ))}
                 <div className="animate-pulse text-slate-500 pt-4 pl-4">_</div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}

