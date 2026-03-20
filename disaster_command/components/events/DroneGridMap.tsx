"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Plane, MapPin, AlertTriangle, Battery, BatteryLow, BatteryMedium, BatteryFull } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Drone {
  id: string;
  label: string;
  pos: number;
  color: string;
  status: string;
  battery: number;
}

interface DroneGridMapProps {
  rows: number;
  cols: number;
  drones: Drone[];
  scannedCells: Set<number>;
  hazardCells: Set<number>;
  survivorSector: number | null;
  survivorFound: boolean;
  isGenerating?: boolean;
}

export function DroneGridMap({
  rows,
  cols,
  drones,
  scannedCells,
  hazardCells,
  survivorSector,
  survivorFound,
  isGenerating = false,
}: DroneGridMapProps) {
  const totalCells = rows * cols;

  const getBatteryIcon = (level: number) => {
    if (level > 70) return <BatteryFull className="w-3 h-3 text-emerald-400" />;
    if (level > 30) return <BatteryMedium className="w-3 h-3 text-amber-400" />;
    return <BatteryLow className="w-3 h-3 text-red-500 animate-pulse" />;
  };

  return (
    <div className="flex-1 bg-slate-50/50 relative overflow-hidden flex items-center justify-center p-8 h-full min-h-[600px]">
      {/* Generating Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/40 backdrop-blur-md"
          >
             <div className="w-64 h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                  className="h-full bg-blue-600"
                />
             </div>
             <p className="mt-4 text-xs font-bold text-slate-600 uppercase tracking-widest animate-pulse">Generating Tactical Grid...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Grid Lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* The Grid Container (7x7) */}
      <div
        className="relative bg-white shadow-2xl rounded-xl border border-slate-200 overflow-hidden"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          width: "min(100%, 600px)",
          aspectRatio: "1/1",
        }}
      >
        {/* Grid Cells */}
        {Array.from({ length: totalCells }).map((_, i) => {
          const isScanned = scannedCells.has(i);
          const isHazard = hazardCells.has(i);
          const hasSurvivor = i === survivorSector;
          const dronesHere = drones.filter((d) => d.pos === i && d.pos !== -1);

          return (
            <div
              key={i}
              className={cn(
                "border-[0.5px] border-slate-100 relative transition-all duration-700",
                isScanned ? "bg-blue-50/30" : "bg-transparent"
              )}
            >
              {/* Scanned Animation */}
              {isScanned && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-blue-100/20"
                />
              )}

              {/* Hazard Indicator */}
              {isHazard && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-amber-500 opacity-40 animate-pulse" />
                </div>
              )}

              {/* Survivor Indicator */}
              {hasSurvivor && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.2 }}
                    className={cn(
                      "w-4 h-4 rounded-full border-2",
                      survivorFound
                        ? "bg-red-500 border-white shadow-[0_0_10px_red]"
                        : "bg-amber-400 border-white animate-ping opacity-60"
                    )}
                  />
                  {survivorFound && (
                    <MapPin className="absolute w-4 h-4 text-white" />
                  )}
                </div>
              )}

              {/* Drone Indicator */}
              <AnimatePresence>
                {dronesHere.map((drone) => (
                  <motion.div
                    key={drone.id}
                    layoutId={`drone-${drone.id}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className={cn(
                      "absolute inset-0 z-10 flex flex-col items-center justify-center",
                      drone.color
                    )}
                    style={{ borderRadius: "inherit" }}
                  >
                    <Plane
                      className={cn(
                        "w-5 h-5 text-white transition-transform duration-500 drop-shadow-md",
                        drone.status === "SURVIVOR CONTACT" && "animate-bounce"
                      )}
                    />
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 pointer-events-none">
                      <div className="bg-slate-900/90 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-sm whitespace-nowrap backdrop-blur-sm border border-white/20 shadow-sm flex items-center gap-1">
                        {drone.label}
                        <span className="opacity-70">|</span>
                        <span className={cn(drone.battery < 30 ? "text-red-400" : "text-emerald-400")}>{drone.battery}%</span>
                      </div>
                      <div className="bg-slate-900/90 p-0.5 rounded-full border border-white/10">
                        {getBatteryIcon(drone.battery)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Base/Hangar Indicator */}
      <div className="absolute bottom-4 right-8 flex items-center gap-3">
         <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base Station</span>
            <span className="text-[9px] text-slate-500 font-medium italic">Recharging Bay Alpha</span>
         </div>
         <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-100/50">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
         </div>
      </div>
    </div>
  );
}
