"use client";

import React from "react";
import { motion } from "framer-motion";

const fleet = [
  { id: "D-01", status: "Active", battery: 84, mission: "Search" },
  { id: "D-02", status: "Active", battery: 62, mission: "Relay" },
  { id: "D-03", status: "Returning", battery: 18, mission: "Medical" },
  { id: "D-04", status: "Charging", battery: 45, mission: "Idle" },
  { id: "D-05", status: "Active", battery: 91, mission: "Survey" },
];

export function ActiveFleetManagement() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[340px]"
    >
      <h3 className="text-lg font-bold text-slate-900 mb-6">Fleet & Battery Health</h3>
      <div className="space-y-4">
        {fleet.map((drone, index) => (
          <div key={drone.id} className="group">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-slate-900 tracking-tighter">{drone.id}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                  drone.status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                  drone.status === 'Returning' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'
                }`}>
                  {drone.status}
                </span>
              </div>
              <span className={`text-xs font-bold ${
                drone.battery < 20 ? 'text-red-500 animate-pulse' : 'text-slate-600'
              }`}>{drone.battery}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${drone.battery}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className={`h-full ${
                  drone.battery < 20 ? 'bg-red-500' :
                  drone.battery < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
