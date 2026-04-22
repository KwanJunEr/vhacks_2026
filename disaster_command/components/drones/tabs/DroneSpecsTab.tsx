"use client";

import React from "react";
import { Gauge, Weight, Zap, Radio, Clock, Wind, Package } from "lucide-react";

interface DroneSpecsTabProps {
  max_speed?: number | null;
  weight?: number | null;
  motors?: number | null;
  range_km?: number | null;
  flight_time_min?: number | null;
  wind_resistance?: string | null;
  payload?: string | null;
}

function SpecCard({
  icon: Icon,
  label,
  value,
  unit,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | number | null;
  unit?: string;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3 shadow-sm">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className="text-xl font-black text-slate-800">
          {value ?? "—"}
          {value != null && unit && (
            <span className="text-xs font-bold text-slate-400 ml-1">{unit}</span>
          )}
        </p>
      </div>
    </div>
  );
}

function SpecTextCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3 shadow-sm col-span-2">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-700">{value ?? "—"}</p>
      </div>
    </div>
  );
}

export default function DroneSpecsTab({
  max_speed,
  weight,
  motors,
  range_km,
  flight_time_min,
  wind_resistance,
  payload,
}: DroneSpecsTabProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <SpecCard icon={Gauge}  label="Max Speed"       value={max_speed}       unit="m/s"  accent="bg-blue-50 text-blue-500" />
      <SpecCard icon={Weight} label="Weight"           value={weight}          unit="kg"   accent="bg-slate-50 text-slate-500" />
      <SpecCard icon={Zap}    label="Motors"           value={motors}                      accent="bg-amber-50 text-amber-500" />
      <SpecCard icon={Radio}  label="Range"            value={range_km}        unit="km"   accent="bg-emerald-50 text-emerald-500" />
      <SpecCard icon={Clock}  label="Flight Time"      value={flight_time_min} unit="min"  accent="bg-purple-50 text-purple-500" />
      <SpecTextCard icon={Wind}    label="Wind Resistance" value={wind_resistance}          accent="bg-cyan-50 text-cyan-500" />
      <SpecTextCard icon={Package} label="Payload"         value={payload}                 accent="bg-indigo-50 text-indigo-500" />
    </div>
  );
}
