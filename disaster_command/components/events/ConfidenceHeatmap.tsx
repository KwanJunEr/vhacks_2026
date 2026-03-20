"use client";

import React from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, AlertTriangle, Info, Map as MapIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export function ConfidenceHeatmap() {
  // 7x7 grid values (0-100 confidence)
  const gridData = Array.from({ length: 49 }, (_, i) => ({
    id: i,
    value: Math.floor(Math.random() * 40) + 60, // 60-100 range
    isEpicenter: i === 24, // Middle for demo
    isHighRisk: [16, 17, 18, 23, 25, 30, 31, 32].includes(i)
  }));

  const getColor = (value: number, isHighRisk: boolean) => {
    if (isHighRisk) return "bg-red-500/80";
    if (value > 90) return "bg-emerald-500/60";
    if (value > 80) return "bg-blue-500/50";
    return "bg-slate-500/20";
  };

  return (
    <div className="flex h-full bg-slate-50/30 overflow-hidden">
      <div className="flex-1 p-8 flex flex-col items-center justify-center">
        <div className="max-w-xl w-full space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-blue-600" /> Confidence Heatmap
            </h3>
            <Badge variant="outline" className="bg-white border-slate-200">Sector 4 Focus</Badge>
          </div>

          <div 
            className="grid grid-cols-7 gap-1 p-4 bg-white rounded-2xl shadow-xl border border-slate-200"
            style={{ aspectRatio: '1/1' }}
          >
            {gridData.map((cell) => (
              <motion.div
                key={cell.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: cell.id * 0.01 }}
                className={cn(
                  "rounded-sm relative group cursor-help",
                  getColor(cell.value, cell.isHighRisk)
                )}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white">{cell.value}%</span>
                </div>
                {cell.isEpicenter && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-white drop-shadow-md animate-pulse" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-red-500/80" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Critical Impact</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-emerald-500/60" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">High Confidence</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-blue-500/50" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Monitoring</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-80 border-l border-slate-200 bg-white p-8 space-y-8 overflow-y-auto">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Info className="w-3.5 h-3.5" /> Sector Analysis
          </h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-900">Highest Uncertainty Zone</p>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Sector 7G shows high signal noise due to terrain interference near Mount Kinabalu. Confidence: 62%.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-900">Primary Epicenter Data</p>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Epicenter confirmed at Grid 4D. Ground-truth sensors show 99.8% correlation with AI predictive model.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <Button variant="outline" className="w-full text-xs font-bold uppercase tracking-widest h-10 border-slate-200 hover:bg-slate-50">
            <MapIcon className="w-3.5 h-3.5 mr-2" /> Open Satellite Overlay
          </Button>
        </div>
      </div>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
