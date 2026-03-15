"use client";

import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Globe3D from "@/components/Globe3D";
import { 
  Activity, 
  AlertTriangle, 
  Users, 
  Zap,
  ArrowUpRight,
  LucideIcon,
  Timer,
  CheckCircle2,
  Plane,
  Siren
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: 'red' | 'blue' | 'yellow' | 'emerald';
}

function StatsCard({ title, value, change, icon: Icon, color }: StatsCardProps) {
  // We use direct class logic for light theme clarity
  const getColors = () => {
      switch(color) {
          case 'red': return { icon: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' };
          case 'blue': return { icon: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' };
          case 'yellow': return { icon: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' };
          default: return { icon: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' };
      }
  };
  
  const colors = getColors();

  return (
    <div className="glass-panel p-6 rounded-xl border border-slate-200 relative overflow-hidden group hover:border-blue-300 hover:shadow-lg transition-all duration-300 bg-white/70">
      <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${colors.icon}`}>
        <Icon className="w-16 h-16" />
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-lg ${colors.bg} ${colors.icon} shadow-sm`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-sm font-medium text-slate-500">{title}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        <span className="text-xs font-medium text-emerald-600 flex items-center bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
          <ArrowUpRight className="w-3 h-3 mr-1" />
          {change}
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [simState, setSimState] = useState<'idle' | 'detecting' | 'alert' | 'deployed'>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [dronesDeployed, setDronesDeployed] = useState(0);

  useEffect(() => {
    // T+2s: Start Detection
    const t1 = setTimeout(() => setSimState('detecting'), 2000);
    
    // T+4s: Confirm Alert and Start Timer
    const t2 = setTimeout(() => {
        setSimState('alert');
    }, 4500);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (simState === 'alert' || simState === 'deployed') {
        const startTime = Date.now();
        interval = setInterval(() => {
            const now = Date.now();
            const diff = (now - startTime) / 1000; // seconds
            
            if (simState !== 'deployed') {
                setElapsedTime(diff);
            }

            // Deployment Simulation
            // Start deploying drones around T+5s relative to alert start
            if (diff > 5 && diff < 23) {
                 // Slowly increment active drones to reach 5 by 23s
                 setDronesDeployed(Math.min(5, Math.floor((diff - 5) / 3.5)));
            }
            
            if (diff >= 23 && simState !== 'deployed') {
                setElapsedTime(23.00); // Lock to exact time
                setDronesDeployed(5);
                setSimState('deployed');
                clearInterval(interval);
            }
        }, 50); // Fast update for smooth timer
    }
    return () => clearInterval(interval);
  }, [simState]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Control Center</h1>
          <p className="text-slate-500">Global situational awareness grid</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => {
               setSimState('idle'); 
               setElapsedTime(0); 
               setDronesDeployed(0);
               setTimeout(() => setSimState('detecting'), 500);
               setTimeout(() => setSimState('alert'), 2500);
             }}
             className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-lg transition-colors border border-slate-200"
           >
             Replay Simulation
           </button>
           <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20 active:scale-95">
             Deploy Asset
           </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Active Alerts" value="12" change="+2.4%" icon={AlertTriangle} color="red" />
        <StatsCard title="Personnel Deployed" value="845" change="+12%" icon={Users} color="blue" />
        <StatsCard title="Drones In-Flight" value="28" change="+5.1%" icon={Zap} color="yellow" />
        <StatsCard title="System Uptime" value="99.9%" change="+0.1%" icon={Activity} color="emerald" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        
        {/* Map / Globe Section */}
        <div className="lg:col-span-2 glass-panel rounded-xl border border-slate-200 flex flex-col relative overflow-hidden bg-white/70 shadow-sm">
          
          {/* Overlay: Simulation Panel */}
          {simState !== 'idle' && (
            <div className={cn(
               "absolute top-6 right-6 z-20 w-80 transition-all duration-500 ease-out",
               simState === 'alert' || simState === 'deployed' ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
               simState === 'detecting' && "opacity-100 translate-y-0"
            )}>
               <div className={cn(
                 "backdrop-blur-xl border rounded-xl shadow-2xl overflow-hidden transition-colors duration-500",
                 simState === 'detecting' ? "bg-amber-50/95 border-amber-200" : 
                 simState === 'deployed' ? "bg-emerald-50/95 border-emerald-200" : 
                 "bg-white/95 border-red-200 ring-4 ring-red-100"
               )}>
                  {/* Header */}
                  <div className={cn(
                    "px-4 py-3 border-b flex items-center justify-between transition-colors duration-500",
                    simState === 'detecting' ? "bg-amber-100/50 border-amber-200" : 
                    simState === 'deployed' ? "bg-emerald-100/50 border-emerald-200" : 
                    "bg-red-50 border-red-100"
                  )}>
                      <div className="flex items-center gap-2">
                          {simState === 'detecting' && <Activity className="w-5 h-5 text-amber-600 animate-pulse" />}
                          {simState === 'alert' && <Siren className="w-5 h-5 text-red-600 animate-pulse" />}
                          {simState === 'deployed' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                          
                          <span className={cn(
                            "font-bold text-sm tracking-tight",
                            simState === 'detecting' ? "text-amber-800" : 
                            simState === 'deployed' ? "text-emerald-800" : 
                            "text-red-700"
                          )}>
                              {simState === 'detecting' ? 'SEISMIC ANOMALY DETECTED' : 
                               simState === 'deployed' ? 'RESPONSE COMPLETE' : 
                               'EARTHQUAKE ALERT'}
                          </span>
                      </div>
                      {simState !== 'detecting' && (
                          <div className="font-mono font-bold text-slate-900 text-lg tabular-nums">
                              {elapsedTime.toFixed(2)}s
                          </div>
                      )}
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-5">
                      {simState === 'detecting' ? (
                          <div className="text-sm text-slate-600 flex items-center gap-3">
                            <div className="w-4 h-4 border-2 border-slate-300 border-t-amber-500 rounded-full animate-spin"></div>
                            Analyzing global sensor array...
                          </div>
                      ) : (
                          <>
                            {/* Visual Comparison */}
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1.5 uppercase tracking-wide">
                                        <span className="text-blue-600">AI System Response</span>
                                        <span className="text-slate-700">{elapsedTime < 23 ? 'Deploying...' : 'Deployed (23s)'}</span>
                                    </div>
                                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                        <div 
                                            className="h-full bg-blue-600 transition-all duration-75 ease-linear shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                                            style={{ width: `${Math.min(100, (elapsedTime / 23) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1.5 uppercase tracking-wide text-slate-400">
                                        <span>Human Response (Avg)</span>
                                        <span>~15 Min Est.</span>
                                    </div>
                                    <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                        <div 
                                            className="h-full bg-slate-300 transition-all duration-1000 ease-linear opacity-50"
                                            style={{ width: `${(elapsedTime / 900) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Status Grid */}
                            <div className="pt-4 border-t border-slate-200/50 grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100 flex flex-col items-center justify-center">
                                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Status</div>
                                    <div className={cn("text-sm font-bold", simState === 'deployed' ? "text-emerald-600" : "text-slate-900")}>
                                        {simState === 'deployed' ? 'Deployed' : 'Active'}
                                    </div>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100 flex flex-col items-center justify-center">
                                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Drones</div>
                                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                        <Plane className="w-4 h-4 text-blue-500" /> 
                                        <span>{dronesDeployed}/5</span>
                                    </div>
                                </div>
                            </div>
                            
                            {simState === 'deployed' && (
                                <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-lg border border-emerald-100 text-center font-medium animate-in fade-in zoom-in duration-300">
                                    Speed Advantage: <span className="font-bold text-emerald-700 text-sm ml-1">45x FASTER</span>
                                </div>
                            )}
                          </>
                      )}
                  </div>
               </div>
            </div>
          )}

          <div className="absolute top-4 left-4 z-10">
            <h3 className="text-lg font-semibold text-slate-900">Live Global Feed</h3>
          </div>
          <div className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50/30">
             <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }}>
                <Suspense fallback={null}>
                  <ambientLight intensity={1.5} />
                  <pointLight position={[10, 10, 10]} intensity={2} color="#3b82f6" />
                  <Globe3D />
                  <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
                </Suspense>
              </Canvas>
          </div>
        </div>

        {/* Right Information Panel */}
        <div className="lg:col-span-1 glass-panel rounded-xl border border-slate-200 p-6 flex flex-col gap-6 bg-white/70 shadow-sm relative overflow-hidden">
             
             {simState === 'alert' && (
                 <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none z-0"></div>
             )}

             <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" /> Latest Activity
                </h3>
                <div className="space-y-4 relative z-10">
                    {/* Dynamic Log Item */}
                    {simState !== 'idle' && (
                        <div className="flex gap-3 animate-in slide-in-from-left duration-300">
                            <div className={cn(
                                "w-2 h-2 mt-2 rounded-full flex-shrink-0 animate-pulse",
                                simState === 'alert' ? "bg-red-500" : "bg-emerald-500"
                            )} />
                            <div>
                                <p className="text-sm font-medium text-slate-900">
                                    {simState === 'detecting' ? 'Analyzing seismic waveforms...' :
                                     simState === 'alert' ? 'CRITICAL: Earthquake Detected (Mag 7.8)' :
                                     'Mission Complete: Drones Deployed'}
                                </p>
                                <p className="text-xs text-slate-500">Just now • Automated Response</p>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex gap-3 opacity-60">
                        <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-slate-900">Drone Fleet 3 Routine Patrol</p>
                            <p className="text-xs text-slate-500">10m ago • Sector 4</p>
                        </div>
                    </div>
                    <div className="flex gap-3 opacity-60">
                        <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-slate-900">Supply Chain Optimization</p>
                            <p className="text-xs text-slate-500">24m ago • AI Logistics</p>
                        </div>
                    </div>
                </div>
             </div>

             <div className="mt-auto relative z-10 hidden sm:block">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">System Status</h4>
                    <div className="flex items-center gap-2 text-emerald-600 font-medium text-sm">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        Operational
                    </div>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
}
