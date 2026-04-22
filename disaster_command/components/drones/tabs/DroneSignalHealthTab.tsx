"use client";

import React from "react";
import { motion } from "framer-motion";

interface DroneSignalHealthTabProps {
  flight_controller?: number | null;
  gps_module?: number | null;
  imu_gyro?: number | null;
  battery_mgmt?: number | null;
  gimbal_control?: number | null;
  comms_link?: number | null;
}

const SYSTEMS = [
  { key: "flight_controller", label: "Flight Controller", icon: "✈" },
  { key: "gps_module",        label: "GPS Module",        icon: "📡" },
  { key: "imu_gyro",          label: "IMU / Gyroscope",   icon: "🔄" },
  { key: "battery_mgmt",      label: "Battery Mgmt",      icon: "🔋" },
  { key: "gimbal_control",    label: "Gimbal Control",    icon: "🎥" },
  { key: "comms_link",        label: "Comms Link",        icon: "📶" },
] as const;

function healthColor(pct: number) {
  if (pct >= 85) return { bar: "from-emerald-500 to-emerald-400", badge: "bg-emerald-50 text-emerald-700", label: "Nominal" };
  if (pct >= 60) return { bar: "from-amber-500 to-amber-400",   badge: "bg-amber-50 text-amber-700",   label: "Degraded" };
  return            { bar: "from-red-500 to-red-400",             badge: "bg-red-50 text-red-700",       label: "Critical" };
}

export default function DroneSignalHealthTab(props: DroneSignalHealthTabProps) {
  const overall = Math.round(
    SYSTEMS.reduce((sum, s) => sum + (props[s.key] ?? 0), 0) / SYSTEMS.length,
  );
  const overallStyle = healthColor(overall);

  return (
    <div className="space-y-6">
      {/* Overall health */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-5 shadow-sm">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
            <motion.circle
              cx="18" cy="18" r="15.9"
              fill="none"
              stroke={overall >= 85 ? "#10b981" : overall >= 60 ? "#f59e0b" : "#ef4444"}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="100"
              initial={{ strokeDashoffset: 100 }}
              animate={{ strokeDashoffset: 100 - overall }}
              transition={{ duration: 1.4, ease: "easeOut" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-slate-700">
            {overall}%
          </span>
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Overall System Health</p>
          <p className="text-xl font-black text-slate-800">{overallStyle.label}</p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${overallStyle.badge}`}>
            {SYSTEMS.length} subsystems monitored
          </span>
        </div>
      </div>

      {/* Per-system bars */}
      <div className="space-y-4">
        {SYSTEMS.map((sys, i) => {
          const pct = props[sys.key] ?? 0;
          const style = healthColor(pct);
          return (
            <div key={sys.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{sys.icon}</span>
                  <span className="text-xs font-bold text-slate-700">{sys.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${style.badge}`}>
                    {style.label}
                  </span>
                  <span className="text-xs font-black text-slate-600 min-w-[36px] text-right">{pct}%</span>
                </div>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.2, delay: i * 0.1, ease: "easeOut" }}
                  className={`h-full rounded-full bg-gradient-to-r ${style.bar}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
