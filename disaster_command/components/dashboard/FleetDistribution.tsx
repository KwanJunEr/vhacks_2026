"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const statusData = [
  {
    name: "Active",
    value: 65,
    color: "bg-blue-500",
    hoverColor: "text-blue-600",
  },
  {
    name: "Charging",
    value: 15,
    color: "bg-emerald-500",
    hoverColor: "text-emerald-600",
  },
  {
    name: "Maintenance",
    value: 12,
    color: "bg-amber-500",
    hoverColor: "text-amber-600",
  },
  {
    name: "Critical",
    value: 8,
    color: "bg-red-500",
    hoverColor: "text-red-600",
  },
];

const batteryData = [
  {
    name: "High (>80%)",
    value: 45,
    color: "bg-emerald-400",
    hoverColor: "text-emerald-500",
  },
  {
    name: "Mid (40-80%)",
    value: 35,
    color: "bg-blue-400",
    hoverColor: "text-blue-500",
  },
  {
    name: "Low (20-40%)",
    value: 15,
    color: "bg-amber-400",
    hoverColor: "text-amber-500",
  },
  {
    name: "Critical (<20%)",
    value: 5,
    color: "bg-rose-400",
    hoverColor: "text-rose-500",
  },
];

interface DonutChartProps {
  data: typeof statusData;
  title: string;
}

function DonutChart({ data, title }: DonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const total = data.reduce((acc, item) => acc + item.value, 0);
  let cumulativeValue = 0;

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="flex flex-col items-center gap-4 flex-1 relative">
      <span className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
        {title}
      </span>
      <div className="relative w-48 h-48" onMouseMove={handleMouseMove}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full transform -rotate-90 drop-shadow-xl"
        >
          {data.map((item, index) => {
            const startAngle = (cumulativeValue / total) * 360;
            const endAngle = ((cumulativeValue + item.value) / total) * 360;
            cumulativeValue += item.value;

            const x1 = 50 + 40 * Math.cos((Math.PI * startAngle) / 180);
            const y1 = 50 + 40 * Math.sin((Math.PI * startAngle) / 180);
            const x2 = 50 + 40 * Math.cos((Math.PI * endAngle) / 180);
            const y2 = 50 + 40 * Math.sin((Math.PI * endAngle) / 180);
            const largeArc = item.value / total > 0.5 ? 1 : 0;

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
                <span
                  className={`text-2xl font-black ${data[hoveredIndex].hoverColor}`}
                >
                  {data[hoveredIndex].value}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase leading-none tracking-tighter">
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
                <span className="text-3xl font-black text-slate-900">
                  {total}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Total
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Details List Below Graph */}
      <div className="w-full mt-6 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${item.color} shadow-sm`} />
              <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  className={`h-full ${item.color}`}
                />
              </div>
              <span className="text-xs font-black text-slate-900 w-8 text-right">{item.value}%</span>
            </div>
          </div>
        ))}
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
              <div
                className={`w-2 h-2 rounded-full ${data[hoveredIndex].color}`}
              />
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

export function FleetDistribution() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-10">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Fleet Intelligence Metrics</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Real-time Swarm Distribution & Energy Analysis</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-blue-50 border border-blue-100 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">
              Live Telemetry
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-around gap-12">
        <DonutChart data={statusData} title="Swarm Operational Status" />
        <div className="w-px self-stretch bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
        <DonutChart data={batteryData} title="Energy Reserve Distribution" />
      </div>
    </motion.div>
  );
}
