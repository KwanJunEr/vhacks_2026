"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plane, Battery, Wifi, Cpu, Settings2, ShieldCheck, AlertTriangle, Zap, ArrowRight, Badge } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { BatteryHistory } from "./BatteryHistory";
import { DetectionViewer } from "./DetectionViewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DroneState {
  id: string;
  label: string;
  pos: number;
  color: string;
  status: string;
  battery: number;
}

interface DroneOpsProps {
  drones: DroneState[];
}

export function DroneOps({ drones }: DroneOpsProps) {
  // Use props if available, otherwise use defaults
  const displayDrones = drones.length > 0 ? drones.map(d => ({
    ...d,
    model: 'Scout-X', // Default model if not in DroneState
    signal: 95 + Math.floor(Math.random() * 5),
    load: 10 + Math.floor(Math.random() * 20)
  })) : [
    { id: 'Alpha-1', model: 'Scout-X', battery: 88, signal: 98, status: 'Active', load: 12 },
    { id: 'Alpha-2', model: 'Scout-X', battery: 92, signal: 95, status: 'Active', load: 8 },
    { id: 'Alpha-3', model: 'Heavy-Lift', battery: 74, signal: 82, status: 'Active', load: 45 },
    { id: 'Alpha-4', model: 'Heavy-Lift', battery: 65, signal: 88, status: 'Active', load: 52 },
  ];

  return (
    <div className="p-8 h-full flex flex-col bg-slate-50/30 overflow-y-auto custom-scrollbar">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">Drone Fleet Operations</h3>
          <p className="text-slate-500 font-medium mt-1">Advanced telemetry, battery diagnostics, and AI detection analysis.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-11 border-slate-200 bg-white shadow-sm gap-2 font-bold px-5">
            <Settings2 className="w-4 h-4 text-slate-500" /> Global Config
          </Button>
          <Button className="h-11 bg-red-600 hover:bg-red-700 text-white gap-2 shadow-xl shadow-red-500/20 font-black px-5 uppercase tracking-widest text-[11px]">
            <AlertTriangle className="w-4 h-4" /> Emergency Recall
          </Button>
        </div>
      </div>

      <Tabs defaultValue="telemetry" className="space-y-8">
        <TabsList className="bg-slate-100/80 backdrop-blur-md border border-slate-200 p-1 rounded-xl w-fit">
          <TabsTrigger value="telemetry" className="px-6 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
            Live Telemetry
          </TabsTrigger>
          <TabsTrigger value="history" className="px-6 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
            Battery History
          </TabsTrigger>
          <TabsTrigger value="detection" className="px-6 py-2 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
            Detection Viewer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="telemetry" className="space-y-8 m-0 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayDrones.map((drone, i) => (
              <motion.div
                key={drone.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2.5rem] opacity-0 group-hover:opacity-10 transition-opacity blur-2xl" />
                <div className="relative glass-panel p-8 rounded-[2.5rem] border border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500 shadow-inner">
                        <Plane className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-slate-900 tracking-tight">{drone.id}</h4>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{drone.model}</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-50 px-3 py-1 font-black text-[9px] uppercase tracking-widest shadow-none">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-2" />
                      {drone.status}
                    </Badge>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <span className="flex items-center gap-2"><Battery className="w-4 h-4 text-blue-500" /> Power Reserves</span>
                        <span className={cn(
                          "tabular-nums text-sm",
                          drone.battery > 80 ? "text-emerald-600" : "text-amber-600"
                        )}>{drone.battery}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${drone.battery}%` }}
                          className={cn(
                            "h-full rounded-full",
                            drone.battery > 80 ? "bg-emerald-500" : "bg-amber-500"
                          )} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 rounded-3xl bg-slate-50/50 border border-slate-100 group-hover:bg-white group-hover:border-blue-100 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <Wifi className="w-4 h-4 text-blue-500" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signal</span>
                        </div>
                        <p className="text-xl font-black text-slate-900 tabular-nums">{drone.signal}%</p>
                      </div>
                      <div className="p-5 rounded-3xl bg-slate-50/50 border border-slate-100 group-hover:bg-white group-hover:border-blue-100 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-amber-500" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Load</span>
                        </div>
                        <p className="text-xl font-black text-slate-900 tabular-nums">{drone.load}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100 flex gap-3">
                    <Button variant="outline" className="flex-1 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                      Live Feed
                    </Button>
                    <Button variant="outline" className="flex-1 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">
                      Control
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Summary Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Cpu className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <h4 className="text-xl font-black uppercase tracking-[0.2em] mb-4 text-blue-400">Swarm Intelligence Status</h4>
                <p className="text-slate-400 font-medium leading-relaxed mb-8 max-w-md">
                  Multi-agent coordination is currently at <span className="text-white font-bold italic">Level 4 Autonomous Stigmergy</span>. All assets reporting optimal network sync.
                </p>
                <div className="flex gap-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Latency</p>
                    <p className="text-2xl font-black">12ms</p>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Sync Rate</p>
                    <p className="text-2xl font-black">99.9%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-blue-600 text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                <ShieldCheck className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <h4 className="text-xl font-black uppercase tracking-[0.2em] mb-4 text-blue-100">Safety Protocol Status</h4>
                <p className="text-blue-100/80 font-medium leading-relaxed mb-8 max-w-md">
                  Collision avoidance and geo-fencing systems are active. Manual override is authorized for command personnel.
                </p>
                <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 font-black uppercase tracking-widest text-[11px] px-8 h-12 rounded-2xl">
                  Review Safety Logs <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="m-0 focus-visible:outline-none">
          <BatteryHistory />
        </TabsContent>

        <TabsContent value="detection" className="m-0 focus-visible:outline-none">
          <DetectionViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
