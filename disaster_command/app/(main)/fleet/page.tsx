/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DroneFleetGrid } from "@/components/drones/DroneFleetGrid";
import { Plane, Zap, ShieldAlert, Cpu } from "lucide-react";

interface FleetStats {
  operational_assets: number;
  total_swarm_power: number;
  maintenance_required: number;
  ai_sync_status: string;
}

export default function FleetPage() {
  const [stats, setStats] = useState<FleetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFleetStats = async () => {
      try {
        console.log(process.env.NEXT_PUBLIC_API_BASE_URL)
        setLoading(true);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/drones/fleet_stats`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch fleet stats");
        }

        const data: FleetStats = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchFleetStats();

    // optional: live refresh every 10s (real-time dashboard feel)
    const interval = setInterval(fetchFleetStats, 10000);

    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      label: "Operational Assets",
      value: stats?.operational_assets ?? "-",
      icon: Plane,
      color: "text-blue-500",
    },
    {
      label: "Total Swarm Power",
      value: stats ? `${stats.total_swarm_power}%` : "-",
      icon: Zap,
      color: "text-amber-500",
    },
    {
      label: "Maintenance Required",
      value: stats?.maintenance_required ?? "-",
      icon: ShieldAlert,
      color: "text-red-500",
    },
    {
      label: "AI Sync Status",
      value: stats?.ai_sync_status ?? "-",
      icon: Cpu,
      color: "text-emerald-500",
    },
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Plane className="w-5 h-5 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Swarm Fleet Terminal
          </h1>
        </div>
        <p className="text-slate-500 font-medium ml-13">
          Advanced 3D Telemetry and Asset Management System
        </p>
      </div>

      {/* Loading / Error */}
      {loading && <p className="text-slate-500">Loading fleet stats...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Stats */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center ${stat.color}`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {stat.label}
                </p>
                <p className="text-2xl font-black text-slate-900">
                  {stat.value}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Grid */}
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