"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, ShieldCheck, Tag, Cpu, Layers, AlignLeft } from "lucide-react";

interface DroneBasicInfoTabProps {
  id: string;
  drone_name: string;
  status: string;
  battery_level: number;
  health_status?: string | null;
  current_x?: number | null;
  current_y?: number | null;
  description?: string | null;
  brand_name?: string | null;
  weight_class?: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  idle: "bg-slate-100 text-slate-600",
  flying: "bg-blue-100 text-blue-700",
  scanning: "bg-purple-100 text-purple-700",
  returning: "bg-amber-100 text-amber-700",
  rescuing: "bg-red-100 text-red-700",
  supplying: "bg-emerald-100 text-emerald-700",
};

const HEALTH_COLORS: Record<string, { bar: string; label: string }> = {
  optimal:  { bar: "bg-emerald-500", label: "text-emerald-600" },
  warning:  { bar: "bg-amber-500",   label: "text-amber-600" },
  critical: { bar: "bg-red-500",     label: "text-red-600" },
};

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-800 truncate">{value ?? "—"}</p>
      </div>
    </div>
  );
}

export default function DroneBasicInfoTab({
  id,
  drone_name,
  status,
  battery_level,
  health_status,
  current_x,
  current_y,
  description,
  brand_name,
  weight_class,
}: DroneBasicInfoTabProps) {
  const statusClass = STATUS_COLORS[status?.toLowerCase()] ?? "bg-slate-100 text-slate-600";
  const healthKey = health_status?.toLowerCase() ?? "optimal";
  const healthStyle = HEALTH_COLORS[healthKey] ?? HEALTH_COLORS.optimal;

  const batteryColor =
    battery_level > 60 ? "bg-emerald-500" :
    battery_level > 30 ? "bg-amber-500" :
    "bg-red-500";

  return (
    <div className="space-y-6">
      {/* Status + name banner */}
      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusClass}`}>
          {status}
        </span>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${healthStyle.label} bg-slate-50`}>
          {health_status ?? "unknown"}
        </span>
      </div>

      {/* Battery */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Battery Level</p>
          <span className="text-sm font-black text-slate-700">{battery_level}%</span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${battery_level}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className={`h-full rounded-full ${batteryColor}`}
          />
        </div>
      </div>

      {/* Info rows */}
      <div className="bg-white rounded-2xl border border-slate-100 px-4 divide-y-0">
        <InfoRow icon={Tag}       label="Drone ID"    value={`#DR-${id}`} />
        <InfoRow icon={Cpu}       label="Drone Name"  value={drone_name} />
        <InfoRow icon={ShieldCheck} label="Brand"    value={brand_name} />
        <InfoRow icon={Layers}    label="Weight Class" value={weight_class} />
        <InfoRow
          icon={MapPin}
          label="Position (X, Y)"
          value={
            current_x != null && current_y != null
              ? `${current_x.toFixed(2)}, ${current_y.toFixed(2)}`
              : "—"
          }
        />
        <InfoRow icon={AlignLeft} label="Description" value={description} />
      </div>
    </div>
  );
}
