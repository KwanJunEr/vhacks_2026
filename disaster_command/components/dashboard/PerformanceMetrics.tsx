"use client";

import React from "react";
import { motion } from "framer-motion";

export function PerformanceMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Mesh Communication Success Rate */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
      >
        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Mesh Comm Success</h4>
        <div className="flex items-end gap-4">
          <div className="flex-1 h-32 flex items-end gap-1.5">
            {[65, 78, 82, 75, 88, 92, 95, 99].map((val, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${val}%` }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="flex-1 bg-blue-500 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
              />
            ))}
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-slate-900">99.2%</span>
            <p className="text-[10px] font-bold text-emerald-600">+1.4% gain</p>
          </div>
        </div>
      </motion.div>

      {/* Drone Recovery Time */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
      >
        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Avg Recovery Time</h4>
        <div className="flex items-end gap-4">
          <div className="flex-1 h-32 flex items-end gap-1.5">
            {[120, 105, 95, 88, 75, 62, 58, 45].map((val, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${(val / 120) * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="flex-1 bg-indigo-500 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
              />
            ))}
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-slate-900">45s</span>
            <p className="text-[10px] font-bold text-emerald-600">-12s improved</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
