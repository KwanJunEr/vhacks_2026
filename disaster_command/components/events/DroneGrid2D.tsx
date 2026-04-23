"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Plane, 
  MapPin, 
  AlertTriangle, 
  Battery, 
  Zap, 
  Package, 
  User, 
  ShieldAlert,
  Info,
  X,
  Droplets,
  ZoomIn,
  ZoomOut,
  Maximize
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { GridDrone, GridEntity } from "./ThreeJSGrid";

interface DroneGrid2DProps {
  drones: GridDrone[];
  entities: GridEntity[];
}

const GRID_SIZE = 20;

const ENTITY_ICONS: Record<string, React.ReactNode> = {
  survivor: <User className="w-3 h-3 text-red-500" />,
  hazard: <ShieldAlert className="w-3 h-3 text-amber-500" />,
  supply: <Package className="w-3 h-3 text-emerald-500" />,
  recharge_station: <Zap className="w-3 h-3 text-blue-500" />,
  water: <Droplets className="w-3 h-3 text-cyan-500" />,
  supply_request: <Package className="w-3 h-3 text-orange-500" />,
};

const ENTITY_COLORS: Record<string, string> = {
  survivor: "border-red-500 bg-red-50",
  hazard: "border-amber-500 bg-amber-50",
  supply: "border-emerald-500 bg-emerald-50",
  recharge_station: "border-blue-500 bg-blue-50",
  water: "border-cyan-500 bg-cyan-50",
  supply_request: "border-orange-500 bg-orange-50",
};

const DRONE_HEX: Record<string, string> = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  yellow: "bg-amber-500",
  purple: "bg-purple-500",
};

export function GridLegend2D() {
  const [isOpen, setIsOpen] = useState(false);

  const items = [
    { icon: <User className="w-3 h-3 text-red-500" />, color: "bg-red-500", label: "Survivor" },
    { icon: <ShieldAlert className="w-3 h-3 text-amber-500" />, color: "bg-amber-500", label: "Hazard" },
    { icon: <Package className="w-3 h-3 text-emerald-500" />, color: "bg-emerald-500", label: "Supply Depot" },
    { icon: <Package className="w-3 h-3 text-orange-500" />, color: "bg-orange-500", label: "Supply Request" },
    { icon: <Droplets className="w-3 h-3 text-cyan-500" />, color: "bg-cyan-500", label: "Water Request" },
    { icon: <Zap className="w-3 h-3 text-blue-500" />, color: "bg-blue-500", label: "Recharge Station" },
    { icon: <Plane className="w-3 h-3 text-white" />, color: "bg-blue-600", label: "Active Drone" },
  ];

  return (
    <div 
      className={cn(
        "bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl transition-all duration-300 overflow-hidden",
        isOpen ? "p-4 w-56" : "p-2 w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-white"
      )}
      onClick={() => !isOpen && setIsOpen(true)}
    >
      {!isOpen ? (
        <Info className="w-5 h-5 text-slate-500" />
      ) : (
        <>
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tactical Legend</p>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-y-2.5">
            {items.map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 group">
                <div className={cn("w-6 h-6 rounded flex items-center justify-center shrink-0 shadow-sm border border-slate-100", item.color)}>
                  {item.icon}
                </div>
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tight group-hover:text-slate-900 transition-colors">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function DroneGrid2D({ drones, entities }: DroneGrid2DProps) {
  const [hoveredCell, setHoveredCell] = useState<{ x: number, y: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const getDronesAt = (x: number, y: number) => {
    return drones.filter(d => {
      const gx = Math.min(19, Math.max(0, Math.round((d.current_x / 100) * 19)));
      const gy = Math.min(19, Math.max(0, Math.round((d.current_y / 100) * 19)));
      return gx === x && gy === y;
    });
  };

  const getEntitiesAt = (x: number, y: number) => {
    return entities.filter(e => e.grid_x === x && e.grid_y === y);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm relative">
      {/* Grid Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Tactical 2D Grid (20×20)</h3>
        </div>
        <div className="flex items-center gap-4">
          {/* Zoom & Pan Controls */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            <button 
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-slate-50 rounded text-slate-500 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-black text-slate-400 w-8 text-center uppercase tracking-tighter">
              {Math.round(zoom * 100)}%
            </span>
            <button 
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-slate-50 rounded text-slate-500 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={handleResetView}
              className="p-1.5 hover:bg-slate-50 rounded text-slate-500 transition-colors"
              title="Reset View"
            >
              <Maximize className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2 px-2 py-0.5 bg-slate-100 rounded-md">
             <span className="text-[9px] font-black text-slate-500 uppercase">{drones.length} Drones</span>
          </div>
        </div>
      </div>

      {/* Grid Area */}
      <div className="flex-1 relative p-6 overflow-hidden flex items-center justify-center bg-slate-50/30 min-h-[550px]">
        <motion.div 
          drag
          dragMomentum={false}
          dragTransition={{ power: 0 }}
          animate={{ 
            scale: zoom,
            x: pan.x,
            y: pan.y
          }}
          onDragEnd={(_, info) => {
            setPan(prev => ({
              x: prev.x + info.offset.x,
              y: prev.y + info.offset.y
            }));
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="grid gap-[1px] bg-slate-200 border-2 border-slate-200 shadow-xl rounded-md cursor-grab active:cursor-grabbing touch-none"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            width: "min(95%, 550px)",
            aspectRatio: "1/1"
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const dronesHere = getDronesAt(x, y);
            const entitiesHere = getEntitiesAt(x, y);
            const isHovered = hoveredCell?.x === x && hoveredCell?.y === y;

            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredCell({ x, y })}
                onMouseLeave={() => setHoveredCell(null)}
                className={cn(
                  "relative bg-white flex items-center justify-center transition-colors duration-200",
                  isHovered ? "bg-blue-50" : "hover:bg-slate-50"
                )}
                style={{ aspectRatio: "1/1" }}
              >
                {/* Entities */}
                {entitiesHere.map((ent, idx) => (
                  <motion.div
                    key={ent.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      "absolute inset-1 rounded-sm border flex items-center justify-center z-0 shadow-sm",
                      ENTITY_COLORS[ent.type]
                    )}
                  >
                    {ENTITY_ICONS[ent.type]}
                  </motion.div>
                ))}

                {/* Drones */}
                {dronesHere.map((drone, idx) => (
                  <motion.div
                    key={drone.id}
                    layoutId={`drone-2d-${drone.id}`}
                    className={cn(
                      "absolute inset-0.5 rounded-md flex items-center justify-center z-10 shadow-md border border-white",
                      DRONE_HEX[drone.color] || "bg-blue-500"
                    )}
                  >
                    <Plane className="w-2.5 h-2.5 text-white" />
                  </motion.div>
                ))}

                {/* Tooltip on Hover */}
                {isHovered && (dronesHere.length > 0 || entitiesHere.length > 0) && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
                    <div className="bg-slate-900 text-white text-[10px] px-2 py-1.5 rounded shadow-xl whitespace-nowrap">
                      {entitiesHere.length > 0 && (
                        <div className="mb-1">
                          <p className="font-black text-blue-400 uppercase tracking-tighter">Entities:</p>
                          {entitiesHere.map(e => <p key={e.id}>{e.name || e.type.toUpperCase()}</p>)}
                        </div>
                      )}
                      {dronesHere.length > 0 && (
                        <div>
                          <p className="font-black text-emerald-400 uppercase tracking-tighter">Drones:</p>
                          {dronesHere.map(d => <p key={d.id}>{d.name} ({d.battery}%)</p>)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Grid Footer / Labels */}
      <div className="px-4 py-2 border-t border-slate-100 flex justify-between bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <span>X-Axis: 0 → 19</span>
        <span>Y-Axis: 0 → 19</span>
      </div>

      {/* Floating Collapsible Legend */}
      <div className="absolute bottom-12 left-4 z-20">
        <GridLegend2D />
      </div>
    </div>
  );
}
