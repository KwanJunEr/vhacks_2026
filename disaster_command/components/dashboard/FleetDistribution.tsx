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
  const total = data.reduce((acc, item) => acc + item.value, 0);
  let cumulativeValue = 0;

  return (
    <div className="flex flex-col items-center gap-4 flex-1">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {title}
      </span>
      <div className="relative w-32 h-32">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full transform -rotate-90"
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
                  scale: isHovered ? 1.05 : 1,
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                transition={{ duration: 0.5 }}
                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                className={`fill-current cursor-pointer transition-all ${item.color.replace("bg-", "text-")}`}
              />
            );
          })}
          <circle cx="50" cy="50" r="28" fill="white" />
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
                  className={`text-xl font-black ${data[hoveredIndex].hoverColor}`}
                >
                  {data[hoveredIndex].value}%
                </span>
                <span className="text-[7px] font-bold text-slate-400 uppercase leading-none">
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
                  {total}%
                </span>
                <span className="text-[7px] font-bold text-slate-400 uppercase">
                  Total
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export function FleetDistribution() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-full max-h-[300px]"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-900">Fleet Metrics</h3>
        <div className="px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-full">
          <span className="text-[8px] font-bold text-blue-600 uppercase tracking-tighter">
            Live Telemetry
          </span>
        </div>
      </div>

      <div className="flex items-center justify-around gap-2">
        <DonutChart data={statusData} title="System Status" />
        <div className="w-px h-24 bg-slate-100 self-center" />
        <DonutChart data={batteryData} title="Battery Levels" />
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {statusData.map((item, index) => (
          <div key={index} className="flex flex-col items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
            <span className="text-[7px] font-bold text-slate-400 uppercase truncate w-full text-center">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
