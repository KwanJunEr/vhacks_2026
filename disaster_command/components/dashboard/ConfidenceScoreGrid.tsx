"use client";

import React from "react";
import { motion } from "framer-motion";

const scores = [
  { label: "Rescue Priority", value: 94, color: "text-red-500" },
  { label: "Survivor Detection", value: 88, color: "text-blue-500" },
  { label: "Battery Status", value: 72, color: "text-emerald-500" },
  { label: "Connectivity Recovery", value: 91, color: "text-indigo-500" },
  { label: "Supply Delivery", value: 85, color: "text-violet-500" },
  { label: "Swarm Coordination", value: 98, color: "text-amber-500" },
  { label: "Default Operations", value: 100, color: "text-slate-500" },
  { label: "Environmental Risk", value: 12, color: "text-rose-500" },
];

export function ConfidenceScoreGrid() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full"
    >
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold text-slate-900">AI Confidence Matrix</h3>
        <div className="flex flex-col items-end">
          <span className="text-2xl font-black text-blue-600">92.4%</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global AI Score</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-10">
        {scores.map((score, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{score.label}</span>
              <span className={`text-sm font-black ${score.color}`}>{score.value}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score.value}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className={`h-full bg-current ${score.color.replace('text-', 'bg-')}`}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
