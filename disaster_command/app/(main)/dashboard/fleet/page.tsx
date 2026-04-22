"use client";

import React from "react";
import { motion } from "framer-motion";
import { DroneFleetGrid } from "@/components/drones/DroneFleetGrid";
import { Plane, Zap, ShieldAlert, Cpu } from "lucide-react";

export default function FleetPage() {
  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Plane className="w-5 h-5 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Swarm Fleet Terminal</h1>
        </div>
        <p className="text-slate-500 font-medium ml-13">Advanced 3D Telemetry and Asset Management System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Operational Assets", value: "24", icon: Plane, color: "text-blue-500" },
          { label: "Total Swarm Power", value: "88%", icon: Zap, color: "text-amber-500" },
          { label: "Maintenance Required", value: "2", icon: ShieldAlert, color: "text-red-500" },
          { label: "AI Sync Status", value: "Nominal", icon: Cpu, color: "text-emerald-500" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Live Asset Grid
          </h2>
        </div>
        
        <DroneFleetGrid />
      </div>
    </div>
  );
}
