"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plane, Battery, Wifi, Cpu, Settings2, ShieldCheck, AlertTriangle, Zap, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DroneOps() {
  const drones = [
    { id: 'Alpha-1', model: 'Scout-X', battery: 88, signal: 98, status: 'Active', load: 12 },
    { id: 'Alpha-2', model: 'Scout-X', battery: 92, signal: 95, status: 'Active', load: 8 },
    { id: 'Alpha-3', model: 'Heavy-Lift', battery: 74, signal: 82, status: 'Active', load: 45 },
  ];

  return (
    <div className="p-8 h-full flex flex-col bg-slate-50/30">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Drone Fleet Operations</h3>
          <p className="text-slate-500 font-medium">Real-time telemetry and manual override controls.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-200 gap-2">
            <Settings2 className="w-4 h-4" /> Global Settings
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-500/20 font-bold">
            <AlertTriangle className="w-4 h-4" /> Emergency Recall
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
        {drones.map((drone, i) => (
          <motion.div
            key={drone.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-all group flex flex-col"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Plane className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{drone.id}</h4>
                  <p className="text-xs text-slate-500 font-medium">{drone.model}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">{drone.status}</span>
              </div>
            </div>

            <div className="space-y-6 flex-1">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Battery className="w-3 h-3" /> Power</span>
                  <span className={cn(
                    "tabular-nums",
                    drone.battery > 80 ? "text-emerald-600" : "text-amber-600"
                  )}>{drone.battery}%</span>
                </div>
                <Progress value={drone.battery} className="h-1.5" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Wifi className="w-3 h-3 text-blue-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Signal</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{drone.signal}%</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Load</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{drone.load}%</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1 text-[11px] font-bold uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600">
                Live Cam
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 text-[11px] font-bold uppercase tracking-widest hover:bg-slate-100">
                Diagnostics
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
