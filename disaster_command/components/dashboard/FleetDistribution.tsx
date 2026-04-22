/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const defaultStatusData = [
  { name: "Idle", value: 0, color: "bg-slate-400", hoverColor: "text-slate-500" },
  { name: "Flying", value: 0, color: "bg-blue-500", hoverColor: "text-blue-600" },
  { name: "Scanning", value: 0, color: "bg-violet-500", hoverColor: "text-violet-600" },
  { name: "Returning", value: 0, color: "bg-amber-500", hoverColor: "text-amber-600" },
  { name: "Rescuing", value: 0, color: "bg-red-500", hoverColor: "text-red-600" },
  { name: "Supplying", value: 0, color: "bg-emerald-500", hoverColor: "text-emerald-600" },
];

const defaultBatteryData = [
  { name: "High (>80%)",    value: 0, color: "bg-emerald-400", hoverColor: "text-emerald-500" },
  { name: "Mid (40-80%)",   value: 0, color: "bg-blue-400",    hoverColor: "text-blue-500" },
  { name: "Low (20-40%)",   value: 0, color: "bg-amber-400",   hoverColor: "text-amber-500" },
  { name: "Critical (<20%)",value: 0, color: "bg-rose-400",    hoverColor: "text-rose-500" },
];

interface DroneDetail {
  id: number;
  name: string;
  status: string;
  battery: number;
}

interface DonutChartProps {
  data: any[];
  title: string;
}

function DonutChart({ data, title }: DonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const total = data.reduce((acc, item) => acc + (item.value || 0), 0);
  const cumulativeValues = data.reduce<number[]>((acc, item) => {
    const prev = acc.length > 0 ? acc[acc.length - 1] : 0;
    return [...acc, prev + (item.value || 0)];
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="flex flex-col flex-1 relative">
      <span className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 text-center">
        {title}
      </span>

      <div className="flex items-center gap-5">
        {/* Donut */}
        <div className="relative w-36 h-36 shrink-0" onMouseMove={handleMouseMove}>
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full transform -rotate-90 drop-shadow-xl"
          >
            {data.map((item, index) => {
              const startAngle =
                ((cumulativeValues[index - 1] ?? 0) / (total || 1)) * 360;
              const endAngle = (cumulativeValues[index] / (total || 1)) * 360;

              const x1 = 50 + 40 * Math.cos((Math.PI * startAngle) / 180);
              const y1 = 50 + 40 * Math.sin((Math.PI * startAngle) / 180);
              const x2 = 50 + 40 * Math.cos((Math.PI * endAngle) / 180);
              const y2 = 50 + 40 * Math.sin((Math.PI * endAngle) / 180);
              const largeArc = item.value / (total || 1) > 0.5 ? 1 : 0;

              const isHovered = hoveredIndex === index;

              return (
                <motion.path
                  key={index}
                  initial={{ pathLength: 0, opacity: 0.8 }}
                  animate={{
                    pathLength: 1,
                    opacity: hoveredIndex === null || isHovered ? 1 : 0.6,
                    scale: isHovered ? 1.08 : 1,
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  className={`fill-current cursor-pointer transition-all ${item.color.replace("bg-", "text-")}`}
                />
              );
            })}
            <circle cx="50" cy="50" r="30" fill="white" className="shadow-inner" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <AnimatePresence mode="wait">
              {hoveredIndex !== null ? (
                <motion.div
                  key="hovered"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center"
                >
                  <span className={`text-lg font-black ${data[hoveredIndex].hoverColor}`}>
                    {data[hoveredIndex].value}%
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase leading-none tracking-tighter text-center px-1">
                    {data[hoveredIndex].name}
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-xl font-black text-slate-900">
                    {total > 100 ? 100 : total}%
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Total
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Legend — single column */}
        <div className="flex flex-col gap-2.5 flex-1">
          {data.map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-2.5 cursor-pointer transition-opacity ${
                hoveredIndex !== null && hoveredIndex !== index ? "opacity-35" : "opacity-100"
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className={`w-3 h-3 rounded shrink-0 ${item.color}`} />
              <span className="text-sm font-semibold text-slate-700 leading-tight">
                {item.name}
              </span>
              <span className={`text-sm font-black ml-auto shrink-0 ${item.hoverColor}`}>
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Tooltip */}
      <AnimatePresence>
        {hoveredIndex !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            style={{
              position: "fixed",
              left: mousePos.x + 15,
              top: mousePos.y - 40,
              zIndex: 100,
            }}
            className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl pointer-events-none"
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${data[hoveredIndex].color}`} />
              <span className="text-xs font-bold whitespace-nowrap">
                {data[hoveredIndex].name}
              </span>
              <span className="text-xs font-black text-blue-400 ml-1">
                {data[hoveredIndex].value}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const statusBadge: Record<string, string> = {
  idle:      "bg-slate-100 text-slate-600",
  flying:    "bg-blue-100 text-blue-700",
  scanning:  "bg-violet-100 text-violet-700",
  returning: "bg-amber-100 text-amber-700",
  rescuing:  "bg-red-100 text-red-700",
  supplying: "bg-emerald-100 text-emerald-700",
};

const statusDot: Record<string, string> = {
  idle:      "bg-slate-400",
  flying:    "bg-blue-500",
  scanning:  "bg-violet-500",
  returning: "bg-amber-500",
  rescuing:  "bg-red-500",
  supplying: "bg-emerald-500",
};

function batteryBarColor(level: number) {
  if (level > 80) return "bg-emerald-500";
  if (level > 40) return "bg-blue-500";
  if (level > 20) return "bg-amber-500";
  return "bg-rose-500";
}

function batteryTextColor(level: number) {
  if (level > 80) return "text-emerald-600";
  if (level > 40) return "text-blue-600";
  if (level > 20) return "text-amber-600";
  return "text-rose-600";
}

export function FleetDistribution() {
  const [statusData, setStatusData] = useState(defaultStatusData);
  const [batteryData, setBatteryData] = useState(defaultBatteryData);
  const [drones, setDrones] = useState<DroneDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/drones/telemetry");
        const data = await response.json();
        if (data.status_data && data.status_data.length > 0) {
          setStatusData(data.status_data);
         
        }
        if (data.battery_data && data.battery_data.length > 0) {
          setBatteryData(data.battery_data);
        }
        if (data.drones) {
          setDrones(data.drones);
        }
      } catch (err) {
        console.error("Failed to fetch drone telemetry:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTelemetry();
     console.log(statusData)
    const interval = setInterval(fetchTelemetry, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Fleet Intelligence Metrics
          </h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Real-time Swarm Distribution & Energy Analysis
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-blue-50 border border-blue-100 rounded-full flex items-center gap-2">
            <div
              className={`w-2 h-2 ${isLoading ? "bg-slate-400 animate-pulse" : "bg-blue-500 animate-pulse"} rounded-full`}
            />
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">
              {isLoading ? "Connecting..." : "Live Telemetry"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-start justify-around gap-8 mb-5">
        <DonutChart data={statusData} title="Swarm Operational Status" />
        <div className="w-px self-stretch bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
        <DonutChart data={batteryData} title="Energy Reserve Distribution" />
      </div>

      {/* Per-drone list */}
      {drones.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
              Individual Units
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {drones.length} drones
            </span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
            {drones.map((drone) => (
              <div
                key={drone.id}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot[drone.status] ?? "bg-slate-400"}`}
                />
                <span className="text-xs font-bold text-slate-700 shrink-0">
                  #{String(drone.id).padStart(3, "0")}
                </span>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tight shrink-0 ${
                    statusBadge[drone.status] ?? "bg-slate-100 text-slate-600"
                  }`}
                >
                  {drone.status}
                </span>
                <div className="flex items-center gap-1 ml-auto shrink-0">
                  <div className="w-10 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${batteryBarColor(drone.battery)}`}
                      style={{ width: `${drone.battery}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-black ${batteryTextColor(drone.battery)}`}>
                    {Math.round(drone.battery)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
