"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Battery, 
  History, 
  TrendingDown, 
  Activity,
  Zap,
  Clock,
  Heart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface BatteryDataPoint {
  time: string;
  percentage: number;
  consumption: number;
}

interface DroneBatteryHistory {
  id: string;
  model: string;
  health: number;
  cycles: number;
  avgFlightTime: string;
  history: BatteryDataPoint[];
}

const MOCK_HISTORY: DroneBatteryHistory[] = [
  {
    id: "Alpha-1",
    model: "Scout-X",
    health: 98,
    cycles: 124,
    avgFlightTime: "45m",
    history: [
      { time: "08:00", percentage: 100, consumption: 0 },
      { time: "08:15", percentage: 85, consumption: 15 },
      { time: "08:30", percentage: 68, consumption: 17 },
      { time: "08:45", percentage: 52, consumption: 16 },
      { time: "09:00", percentage: 35, consumption: 17 },
      { time: "09:15", percentage: 18, consumption: 17 },
      { time: "10:30", percentage: 100, consumption: 0 }, // Recharged
    ]
  },
  {
    id: "Alpha-2",
    model: "Scout-X",
    health: 96,
    cycles: 89,
    avgFlightTime: "42m",
    history: [
      { time: "08:10", percentage: 100, consumption: 0 },
      { time: "08:25", percentage: 82, consumption: 18 },
      { time: "08:40", percentage: 65, consumption: 17 },
      { time: "08:55", percentage: 48, consumption: 17 },
      { time: "09:10", percentage: 31, consumption: 17 },
    ]
  },
  {
    id: "Alpha-3",
    model: "Heavy-Lift",
    health: 92,
    cycles: 245,
    avgFlightTime: "30m",
    history: [
      { time: "07:30", percentage: 100, consumption: 0 },
      { time: "07:45", percentage: 75, consumption: 25 },
      { time: "08:00", percentage: 45, consumption: 30 },
      { time: "08:15", percentage: 15, consumption: 30 },
    ]
  },
  {
    id: "Alpha-4",
    model: "Heavy-Lift",
    health: 88,
    cycles: 312,
    avgFlightTime: "28m",
    history: [
      { time: "08:00", percentage: 100, consumption: 0 },
      { time: "08:15", percentage: 70, consumption: 30 },
      { time: "08:30", percentage: 40, consumption: 30 },
      { time: "08:45", percentage: 10, consumption: 30 },
    ]
  }
];

export function BatteryHistory() {
  const [selectedDrone, setSelectedDrone] = useState<string>("Alpha-1");
  const [dateRange, setDateRange] = useState<string>("today");

  const currentDroneData = useMemo(() => 
    MOCK_HISTORY.find(d => d.id === selectedDrone) || MOCK_HISTORY[0],
    [selectedDrone]
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">Battery Usage History</h4>
            <p className="text-xs text-slate-500 font-medium">Historical telemetry & health diagnostics.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
            {MOCK_HISTORY.map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDrone(d.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  selectedDrone === d.id 
                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200" 
                    : "text-slate-500 hover:bg-white/50"
                )}
              >
                {d.id}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
            {['today', 'yesterday', 'last-7'].map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  dateRange === range 
                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200" 
                    : "text-slate-500 hover:bg-white/50"
                )}
              >
                {range.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Battery Health', value: `${currentDroneData.health}%`, icon: Heart, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Charge Cycles', value: currentDroneData.cycles, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Avg Flight Time', value: currentDroneData.avgFlightTime, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Degradation', value: '1.2%', icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4"
          >
            <div className={cn("p-2.5 rounded-xl", stat.bg, stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-lg font-black text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h5 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" /> Consumption Timeline
          </h5>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Battery %</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Consumption Rate</span>
            </div>
          </div>
        </div>

        <div className="h-64 relative mt-4 flex items-end justify-between px-2">
          {/* Simple custom SVG chart for battery percentage */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="batteryGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              d={currentDroneData.history.reduce((acc, point, i, arr) => {
                const x = (i / (arr.length - 1)) * 1000;
                const y = 200 - (point.percentage / 100) * 180;
                return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
              }, "")}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <motion.path
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              d={currentDroneData.history.reduce((acc, point, i, arr) => {
                const x = (i / (arr.length - 1)) * 1000;
                const y = 200 - (point.percentage / 100) * 180;
                return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
              }, "") + ` L 1000 200 L 0 200 Z`}
              fill="url(#batteryGradient)"
            />
          </svg>

          {/* X-axis labels and points */}
          {currentDroneData.history.map((point, i) => (
            <div key={i} className="relative group flex flex-col items-center" style={{ width: `${100 / currentDroneData.history.length}%` }}>
              <div className="h-40 w-px bg-slate-100 relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.5 + (i * 0.1) }}
                  className="absolute w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white shadow-sm -translate-x-1/2"
                  style={{ bottom: `${point.percentage}%` }}
                />
              </div>
              <span className="text-[9px] font-bold text-slate-400 mt-4 uppercase">{point.time}</span>
              
              <AnimatePresence>
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white p-2 rounded-lg text-[9px] font-bold z-20 pointer-events-none whitespace-nowrap">
                  <p>Battery: {point.percentage}%</p>
                  <p>Cons: {point.consumption}%/min</p>
                </div>
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
