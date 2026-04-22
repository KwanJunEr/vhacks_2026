"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Battery, 
  Signal, 
  Activity, 
  ShieldCheck, 
  Cpu,
  Map as MapIcon,
  Clock,
  Settings
} from "lucide-react";
import DroneCard from "@/components/drones/DroneCard";

export default function DroneDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [drone, setDrone] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDrone = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/drones/detailed_fleet`);
        const data = await response.json();
        const foundDrone = data.drones.find((d: any) => d.id === params.id);
        setDrone(foundDrone);
      } catch (err) {
        console.error("Error fetching drone detail:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDrone();
  }, [params.id]);

  if (isLoading) return <div className="p-12 text-emerald-500 font-mono">ACCESSING ENCRYPTED DATA...</div>;
  if (!drone) return <div className="p-12 text-red-500 font-mono">DRONE UNIT NOT FOUND</div>;

  return (
    <div className="space-y-8 pb-12">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-xs uppercase tracking-widest"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Swarm
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-[#0a1a10] to-[#061209] rounded-3xl border border-[#0d2e18] p-4 h-[400px] shadow-2xl relative overflow-hidden flex items-center justify-center">
             <div className="absolute top-6 left-6 z-10">
                <span className="text-[10px] font-black text-emerald-500/50 uppercase tracking-[0.3em]">Holographic Telemetry</span>
             </div>
             <DroneCard {...drone} />
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-500" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="py-3 px-4 bg-blue-50 text-blue-600 rounded-xl font-bold text-[10px] uppercase hover:bg-blue-100 transition-all">Manual Override</button>
              <button className="py-3 px-4 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-[10px] uppercase hover:bg-emerald-100 transition-all">Reroute Mission</button>
              <button className="py-3 px-4 bg-amber-50 text-amber-600 rounded-xl font-bold text-[10px] uppercase hover:bg-amber-100 transition-all">Reboot Core</button>
              <button className="py-3 px-4 bg-red-50 text-red-600 rounded-xl font-bold text-[10px] uppercase hover:bg-red-100 transition-all">Emergency Land</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{drone.name}</h1>
              <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest">{drone.status}</span>
            </div>
            <p className="text-slate-500 font-medium text-lg">{drone.brand} {drone.model} • {drone.profile}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Battery Reserve", value: `${drone.battery}%`, icon: Battery, color: "text-emerald-500", bg: "bg-emerald-50" },
              { label: "Signal Strength", value: "-42 dBm", icon: Signal, color: "text-blue-500", bg: "bg-blue-50" },
              { label: "Uptime", value: "14h 22m", icon: Clock, color: "text-indigo-500", bg: "bg-indigo-50" },
            ].map((stat, i) => (
              <div key={i} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Sub-System Diagnostics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {[
                { label: "Avionics Processor", value: 98, status: "Nominal" },
                { label: "Propulsion Synchronizer", value: 94, status: "Optimal" },
                { label: "Optical Sensor Array", value: 89, status: "Good" },
                { label: "Mesh Comms Bridge", value: 100, status: "Nominal" },
                { label: "Thermal Analysis Engine", value: 92, status: "Optimal" },
                { label: "Landing Gear Servo", value: 100, status: "Nominal" },
              ].map((sys, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-600">{sys.label}</span>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">{sys.status}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${sys.value}%` }}
                      transition={{ duration: 1.5, delay: i * 0.1 }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
