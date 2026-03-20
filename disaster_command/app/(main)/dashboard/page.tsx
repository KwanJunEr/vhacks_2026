"use client";

import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Globe3D from "@/components/Globe3D";
import { 
  Activity, 
  AlertTriangle, 
  Users, 
  CheckCircle2,
  Plane,
  Siren,
  ShieldCheck,
  MapPin,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const [simState, setSimState] = useState<'idle' | 'detecting' | 'detected'>('idle');
  const [totalDrones, setTotalDrones] = useState(0);

  useEffect(() => {
    const fetchDroneCount = async () => {
      const { count, error } = await supabase
        .from('drone_fleet')
        .select('*', { count: 'exact', head: true });
      
      if (!error && count !== null) {
        setTotalDrones(count);
      }
    };
    fetchDroneCount();
  }, []);

  useEffect(() => {
    // T+2s: Start Detection Simulation
    const t1 = setTimeout(() => setSimState('detecting'), 2000);
    
    // T+6s: Detection Complete
    const t2 = setTimeout(() => {
        setSimState('detected');
    }, 6000);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Command Center</h1>
          <p className="text-slate-500">Southeast Asia Disaster Response Awareness Grid</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatsCard title="Disasters (2026)" value="12" change="+2.4%" icon={AlertTriangle} color="red" index={0} />
        <StatsCard title="Available Personnel" value="845" change="+12%" icon={Users} color="blue" index={1} />
        <StatsCard title="Available Drones" value={totalDrones} change="+5.1%" icon={Plane} color="indigo" index={2} />
        <StatsCard title="Active Missions" value="3" change="+1" icon={ShieldCheck} color="yellow" index={3} />
        <StatsCard title="System Uptime" value="99.9%" change="+0.1%" icon={Activity} color="emerald" index={4} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        
        {/* Map / Globe Section */}
        <div className="lg:col-span-2 glass-panel rounded-xl border border-slate-200 flex flex-col relative overflow-hidden bg-white/70 shadow-sm">
          
          {/* Overlay: Simulation Panel */}
          <AnimatePresence>
            {simState !== 'idle' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-6 right-6 z-20 w-80"
              >
                <div className={cn(
                  "backdrop-blur-xl border rounded-xl shadow-2xl overflow-hidden transition-colors duration-500",
                  simState === 'detecting' ? "bg-amber-50/95 border-amber-200" : "bg-red-50/95 border-red-200 ring-4 ring-red-100"
                )}>
                    {/* Header */}
                    <div className={cn(
                      "px-4 py-3 border-b flex items-center gap-2 transition-colors duration-500",
                      simState === 'detecting' ? "bg-amber-100/50 border-amber-200" : "bg-red-100/50 border-red-200"
                    )}>
                        {simState === 'detecting' ? (
                          <Activity className="w-5 h-5 text-amber-600 animate-pulse" />
                        ) : (
                          <Siren className="w-5 h-5 text-red-600 animate-pulse" />
                        )}
                        <span className={cn(
                          "font-bold text-sm tracking-tight",
                          simState === 'detecting' ? "text-amber-800" : "text-red-700"
                        )}>
                            {simState === 'detecting' ? 'SEISMIC ANOMALY DETECTED' : 'EARTHQUAKE ALERT'}
                        </span>
                    </div>

                    {/* Body */}
                    <div className="p-5">
                        {simState === 'detecting' ? (
                            <div className="flex flex-col items-center gap-4 py-4 text-center">
                              <div className="w-12 h-12 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div>
                              <p className="text-sm font-medium text-slate-600">Analyzing global sensor array for waveform confirmation...</p>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-100/50 border border-red-200">
                                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-red-900">Magnitude 6.2 Detected</p>
                                        <p className="text-xs text-red-700 font-medium">Confirmation: High Confidence (98%)</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                    Real-time Impact Analysis Active
                                </div>
                            </div>
                        )}
                    </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
             
             {simState === 'detected' && (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none z-0"
                 />
             )}

             <div className="flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" /> Latest Activity
                </h3>
                
                <div className="space-y-6 relative z-10">
                    <AnimatePresence mode="popLayout">
                        {simState === 'detected' && (
                            <motion.div 
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              className="flex gap-4 p-4 rounded-xl bg-red-50 border border-red-100 shadow-sm"
                            >
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Earthquake Detected in Sabah</p>
                                    <p className="text-xs text-red-600 font-semibold mb-1">Region: Ranau District</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">Automated Alert • Just Now</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {simState === 'detecting' && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex gap-3 px-2"
                        >
                            <div className="w-2 h-2 mt-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-slate-900 tracking-tight">Analyzing seismic waveforms...</p>
                                <p className="text-[10px] text-slate-400 uppercase font-bold">Signal Confirmation in progress</p>
                            </div>
                        </motion.div>
                    )}
                </div>

                {simState === 'detected' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 relative z-10"
                    >
                        <Link href="/events">
                            <button className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 transition-all active:scale-[0.98] group">
                                Navigate to Missions
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                    </motion.div>
                )}
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
