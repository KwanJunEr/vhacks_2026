"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Plane, MapPin, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface Drone {
  id: number;
  label: string;
  pos: number;
  color: string;
  status: string;
}

interface DroneGridMapProps {
  rows: number;
  cols: number;
  drones: Drone[];
  scannedCells: Set<number>;
  hazardCells: Set<number>;
  survivorSector: number | null;
  survivorFound: boolean;
}

export function DroneGridMap({
  rows,
  cols,
  drones,
  scannedCells,
  hazardCells,
  survivorSector,
  survivorFound,
}: DroneGridMapProps) {
  const totalCells = rows * cols;

  return (
    <div className="flex-1 bg-slate-50/50 relative overflow-hidden flex items-center justify-center p-8 min-h-[500px]">
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
          const dronesHere = drones.filter((d) => d.pos === i);

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
              {dronesHere.map((drone) => (
                <motion.div
                  key={drone.id}
                  layoutId={`drone-${drone.id}`}
                  className={cn(
                    "absolute inset-0 z-10 flex items-center justify-center",
                    drone.color
                  )}
                  style={{ borderRadius: "inherit" }}
                >
                  <Plane
                    className={cn(
                      "w-6 h-6 text-white transition-transform duration-500 drop-shadow-md",
                      drone.status === "SURVIVOR CONTACT" && "animate-bounce"
                    )}
                  />
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white text-[8px] font-bold px-1 rounded-sm whitespace-nowrap backdrop-blur-sm border border-white/20">
                    {drone.label}
                  </div>
                </motion.div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
