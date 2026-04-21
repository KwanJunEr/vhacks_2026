"use client";

import React from "react";
import { motion } from "framer-motion";

const trendData = [72, 75, 74, 78, 82, 85, 89, 94];

export function AICoordinationTrend() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full max-h-[300px]"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-0.5">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            AI Coordination Accuracy
          </h4>
          <p className="text-[8px] font-bold text-emerald-600 tracking-tight">
            ↑ 22% improvement
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-slate-900">94.2%</span>
        </div>
      </div>

      <div className="flex-1 flex items-end gap-2 pb-2">
        {trendData.map((val, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1 group"
          >
            <div className="w-full bg-slate-50 rounded-lg relative overflow-hidden h-24 border border-slate-100/50">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${val}%` }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 group-hover:from-blue-500 group-hover:to-blue-300 transition-colors"
              />
            </div>
            <span className="text-[7px] font-bold text-slate-400 uppercase">
              Q{i + 1}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-900">72%</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase">
              Start
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-emerald-600">
              +22.2%
            </span>
            <span className="text-[8px] font-bold text-slate-400 uppercase">
              Growth
            </span>
          </div>
        </div>
        <div className="px-2 py-1 bg-blue-50 border border-blue-100 rounded text-[8px] font-black text-blue-600 uppercase tracking-tighter">
          ML Optimized
        </div>
      </div>
    </motion.div>
  );
}
