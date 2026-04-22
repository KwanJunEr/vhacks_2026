"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bell, CheckCircle2, AlertCircle } from "lucide-react";

const alerts = [
  {
    id: 1,
    type: "success",
    title: "Scanned all grids",
    time: "2m ago",
    desc: "Grid sector A1-F9 fully processed with no thermal anomalies.",
  },
  {
    id: 2,
    type: "critical",
    title: "Survivor detected",
    time: "5m ago",
    desc: "Thermal signature match in Sector C4. Swarm re-routing for visual confirmation.",
  },
  {
    id: 3,
    type: "warning",
    title: "Connectivity drop",
    time: "12m ago",
    desc: "Node-43 mesh signal weak. Deploying relay drone.",
  },
  {
    id: 4,
    type: "info",
    title: "Supply delivered",
    time: "18m ago",
    desc: "Medical package delivered to LZ Bravo.",
  },
];

export function CriticalAlertsLog() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">
          Critical Operations Log
        </h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Real-time Feed
        </span>
      </div>

      <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[500px]">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-4 p-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors border border-slate-100/50 hover:border-slate-200"
          >
            <div
              className={`mt-1 shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                alert.type === "critical"
                  ? "bg-red-100 text-red-600"
                  : alert.type === "success"
                    ? "bg-emerald-100 text-emerald-600"
                    : alert.type === "warning"
                      ? "bg-amber-100 text-amber-600"
                      : "bg-blue-100 text-blue-600"
              }`}
            >
              {alert.type === "critical" ? (
                <AlertCircle className="w-4 h-4" />
              ) : alert.type === "success" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-bold text-slate-800">
                  {alert.title}
                </h4>
                <span className="text-[10px] font-bold text-slate-400">
                  {alert.time}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {alert.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
