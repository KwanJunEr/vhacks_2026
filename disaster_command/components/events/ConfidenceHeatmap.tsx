"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Info, 
  Map as MapIcon, 
  UserRoundSearch, 
  ShieldAlert, 
  Clock, 
  Target,
  Navigation,
  MapPin,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ConfidenceHeatmapProps {
  scannedCells: Set<number>;
  survivorSector: number | null;
  survivorFound: boolean;
}

export function ConfidenceHeatmap({ scannedCells, survivorSector, survivorFound }: ConfidenceHeatmapProps) {
  const ROWS = 7;
  const COLS = 7;
  const epicenter = 24; // Center of 7x7 grid

  // Generate grid data with risk levels and priority zones
  const gridData = useMemo(() => {
    return Array.from({ length: 49 }, (_, i) => {
      const row = Math.floor(i / COLS);
      const col = i % COLS;
      const epiRow = Math.floor(epicenter / COLS);
      const epiCol = epicenter % COLS;
      
      // Calculate distance from epicenter for risk level
      const distance = Math.sqrt(Math.pow(row - epiRow, 2) + Math.pow(col - epiCol, 2));
      const riskLevel = Math.max(0, 10 - distance * 1.5);
      
      // Confidence score (simulated based on distance and scan status)
      const baseConfidence = 90 - distance * 5;
      const confidence = scannedCells.has(i) ? baseConfidence + (Math.random() * 5) : baseConfidence - 15;
      
      // Priority Zones
      let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      if (riskLevel > 7.5) priority = 'HIGH';
      else if (riskLevel > 5) priority = 'MEDIUM';

      return {
        id: i,
        row,
        col,
        riskLevel,
        confidence,
        priority,
        isEpicenter: i === epicenter,
        isScanned: scannedCells.has(i),
        isSurvivor: i === survivorSector && survivorFound,
        lastScanned: scannedCells.has(i) ? new Date(Date.now() - Math.random() * 100000).toLocaleTimeString() : null
      };
    });
  }, [scannedCells, survivorSector, survivorFound]);

  const getRiskColor = (level: number) => {
    if (level > 8) return "bg-red-600/80";
    if (level > 6) return "bg-orange-500/70";
    if (level > 4) return "bg-amber-400/60";
    return "bg-slate-400/20";
  };

  const getPriorityBorder = (priority: string) => {
    if (priority === 'HIGH') return "border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]";
    if (priority === 'MEDIUM') return "border-orange-400/30";
    return "border-transparent";
  };

  return (
    <TooltipProvider>
      <div className="flex h-full bg-slate-50/30 overflow-hidden">
        {/* Main Visualization */}
        <div className="flex-1 p-8 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto w-full space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                  <LayoutDashboard className="w-7 h-7 text-blue-600" /> Analytical Risk Heatmap
                </h3>
                <p className="text-slate-500 text-sm font-medium mt-1">Quantitative impact assessment and confidence distribution.</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 font-bold px-3 py-1">
                  <Clock className="w-3.5 h-3.5 mr-1.5" /> Live Sync: {new Date().toLocaleTimeString()}
                </Badge>
                <Badge className="bg-blue-600 text-white font-bold px-3 py-1 shadow-lg shadow-blue-500/20">
                  MAS Active
                </Badge>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="relative p-6 bg-white rounded-3xl shadow-2xl border border-slate-200">
              {/* Grid Overlay for Labels */}
              <div className="absolute -left-8 top-12 bottom-12 flex flex-col justify-between text-[10px] font-bold text-slate-400">
                {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(l => <span key={l}>{l}</span>)}
              </div>
              <div className="absolute left-12 right-12 -bottom-6 flex justify-between text-[10px] font-bold text-slate-400">
                {[1, 2, 3, 4, 5, 6, 7].map(l => <span key={l}>{l}</span>)}
              </div>

              <div 
                className="grid grid-cols-7 gap-2"
                style={{ aspectRatio: '1/1' }}
              >
                {gridData.map((cell) => (
                  <Tooltip key={cell.id}>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                          "rounded-xl relative group cursor-crosshair border-2 transition-all duration-300",
                          getRiskColor(cell.riskLevel),
                          getPriorityBorder(cell.priority),
                          !cell.isScanned && "opacity-40 saturate-50"
                        )}
                      >
                        {/* Scan Overlay */}
                        {cell.isScanned && (
                          <div className="absolute top-1 right-1">
                            <ShieldAlert className="w-2.5 h-2.5 text-white/50" />
                          </div>
                        )}

                        {/* Survivor Flag */}
                        {cell.isSurvivor && (
                          <div className="absolute inset-0 flex items-center justify-center z-20">
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                              className="bg-white rounded-full p-1 shadow-xl"
                            >
                              <UserRoundSearch className="w-5 h-5 text-red-600" />
                            </motion.div>
                          </div>
                        )}

                        {/* Epicenter Marker */}
                        {cell.isEpicenter && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-40">
                            <Target className="w-8 h-8 text-white animate-spin-slow" />
                          </div>
                        )}

                        {/* Cell Value */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 rounded-xl transition-opacity z-10 backdrop-blur-[2px]">
                          <div className="text-center">
                            <p className="text-[10px] font-black text-white">{cell.confidence.toFixed(1)}%</p>
                            <p className="text-[8px] font-bold text-white/70 uppercase">Conf.</p>
                          </div>
                        </div>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-900 text-white border-slate-800 p-4 rounded-xl shadow-2xl w-56">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sector {String.fromCharCode(65 + cell.row)}{cell.col + 1}</span>
                          <Badge className={cn(
                            "text-[8px] px-1.5 h-4 font-bold",
                            cell.priority === 'HIGH' ? "bg-red-500" : cell.priority === 'MEDIUM' ? "bg-orange-500" : "bg-blue-500"
                          )}>{cell.priority} PRIORITY</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Risk Level</p>
                            <p className="text-sm font-black text-white">{cell.riskLevel.toFixed(1)}/10</p>
                          </div>
                          <div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Confidence</p>
                            <p className="text-sm font-black text-emerald-400">{cell.confidence.toFixed(1)}%</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Status</p>
                          <div className="flex items-center gap-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full", cell.isScanned ? "bg-emerald-500" : "bg-slate-500")} />
                            <span className="text-[10px] font-bold">{cell.isScanned ? `Scanned at ${cell.lastScanned}` : 'Unscanned'}</span>
                          </div>
                        </div>
                        {cell.isSurvivor && (
                          <div className="mt-2 p-2 bg-red-500/20 border border-red-500/50 rounded-lg">
                            <p className="text-[10px] font-black text-red-400 uppercase mb-1">Survivor Metadata</p>
                            <div className="space-y-1 text-[9px] font-bold text-slate-200">
                              <p>Lat: 6.012°N | Lon: 116.673°E</p>
                              <p>Confidence: 98.4% (Thermal + Audio)</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Legend & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Risk Indicators</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Critical Impact', color: 'bg-red-600/80', range: '8.0 - 10.0' },
                    { label: 'High Risk', color: 'bg-orange-500/70', range: '6.0 - 8.0' },
                    { label: 'Moderate', color: 'bg-amber-400/60', range: '4.0 - 6.0' }
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-sm", item.color)} />
                        <span className="text-[11px] font-bold text-slate-600">{item.label}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{item.range}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Coverage Analysis</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1.5">
                      <span>Tactical Coverage</span>
                      <span>{Math.round((scannedCells.size / 49) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(scannedCells.size / 49) * 100}%` }}
                        className="h-full bg-blue-600 rounded-full"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    Average confidence across scanned sectors: <span className="text-emerald-600 font-bold">92.4%</span>
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20">
                <h4 className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-4">Priority Action</h4>
                <div className="flex items-start gap-3">
                  <Navigation className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-xs font-bold leading-snug">Redirect Alpha-3 to Sector D5. High-probability thermal signature detected outside primary epicenter.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Sector Analysis */}
        <div className="w-96 border-l border-slate-200 bg-white p-8 space-y-10 overflow-y-auto custom-scrollbar">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Info className="w-4 h-4" /> Sector Insight Matrix
            </h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Highest Uncertainty Zone</p>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-200 text-amber-800 text-[9px] font-black">SECTOR G7</Badge>
                    <span className="text-[11px] font-bold text-amber-800">Uncertainty: 38%</span>
                  </div>
                  <p className="text-[11px] text-amber-900/70 leading-relaxed font-medium">
                    Signal noise interference from terrain shadowing near Mount Kinabalu foothills. Suggesting SAR-UAV deployment for lower altitude ground-truth.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Critical Detection Flag</p>
                <div className={cn(
                  "p-4 rounded-2xl transition-all duration-500 border",
                  survivorFound ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200 opacity-50"
                )}>
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={cn(
                      "text-[9px] font-black",
                      survivorFound ? "bg-red-600 text-white" : "bg-slate-400 text-white"
                    )}>
                      {survivorFound ? 'SURVIVOR CONFIRMED' : 'NO ACTIVE FLAGS'}
                    </Badge>
                    {survivorFound && <span className="text-[10px] font-bold text-red-600 animate-pulse">LIVE</span>}
                  </div>
                  {survivorFound ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-red-500" /> D5 (6.01, 116.67)
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Target className="w-3 h-3 text-blue-500" /> 98.4% Match
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-700 leading-relaxed font-medium italic">
                        "Visual confirmation of movement in structural void. Heart rate sensor picking up 112 BPM."
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                      Scanning for thermal signatures and acoustic distress signals across priority quadrants...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-100">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recommended Actions</h4>
            <div className="space-y-2">
              {[
                { label: 'Dispatch Alpha-1 to Sector B2', priority: 'MEDIUM' },
                { label: 'Initiate 3D Structural Scan D5', priority: 'CRITICAL' },
                { label: 'Monitor Battery levels Alpha-4', priority: 'LOW' }
              ].map((action, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 group cursor-pointer hover:border-blue-200 transition-colors">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    action.priority === 'CRITICAL' ? "bg-red-500" : action.priority === 'MEDIUM' ? "bg-blue-500" : "bg-slate-400"
                  )} />
                  <span className="text-[11px] font-bold text-slate-700 flex-1">{action.label}</span>
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <Button className="w-full h-12 rounded-xl bg-slate-900 hover:bg-black text-white font-bold uppercase tracking-widest text-[11px] shadow-xl">
              <MapIcon className="w-4 h-4 mr-2" /> Download Full Risk Report
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
