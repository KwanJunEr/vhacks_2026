"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Pause, 
  Video, 
  Scan, 
  UserSearch, 
  Building2, 
  AlertTriangle, 
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Detection {
  id: string;
  type: 'PERSON' | 'BUILDING_DAMAGE' | 'FIRE';
  confidence: number;
  box: [number, number, number, number]; // [x, y, w, h] in %
  timestamp: string;
}

interface DroneAnalysis {
  droneId: string;
  videoSrc: string;
  detections: Detection[];
}

const ANALYSIS_DATA: DroneAnalysis[] = [
  {
    droneId: 'Alpha-1',
    videoSrc: '/disaster_detection.mp4',
    detections: [
      { id: 'D-001', type: 'PERSON', confidence: 0.98, box: [20, 30, 15, 25], timestamp: '00:12' },
      { id: 'D-002', type: 'BUILDING_DAMAGE', confidence: 0.85, box: [50, 20, 30, 40], timestamp: '00:15' },
    ]
  },
  {
    droneId: 'Alpha-2',
    videoSrc: '/disaster_detection.mp4',
    detections: [
      { id: 'D-003', type: 'PERSON', confidence: 0.94, box: [65, 45, 12, 20], timestamp: '00:08' },
      { id: 'D-004', type: 'FIRE', confidence: 0.78, box: [10, 60, 25, 30], timestamp: '00:22' },
    ]
  },
  {
    droneId: 'Alpha-3',
    videoSrc: '/disaster_detection.mp4',
    detections: [
      { id: 'D-005', type: 'BUILDING_DAMAGE', confidence: 0.91, box: [30, 40, 40, 50], timestamp: '00:05' },
      { id: 'D-006', type: 'PERSON', confidence: 0.88, box: [80, 70, 10, 15], timestamp: '00:18' },
    ]
  },
  {
    droneId: 'Alpha-4',
    videoSrc: '/disaster_detection.mp4',
    detections: [
      { id: 'D-007', type: 'FIRE', confidence: 0.95, box: [40, 50, 20, 30], timestamp: '00:10' },
      { id: 'D-008', type: 'BUILDING_DAMAGE', confidence: 0.82, box: [15, 15, 25, 25], timestamp: '00:25' },
    ]
  }
];

export function DetectionViewer() {
  const [activeDroneIdx, setActiveDroneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const currentAnalysis = ANALYSIS_DATA[activeDroneIdx];

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (isPlaying) videoRef.current.play();
    }
  }, [activeDroneIdx]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-100 text-red-600">
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">Disaster Detection Viewer</h4>
            <p className="text-xs text-slate-500 font-medium">Multi-agent composite analysis overlay.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
          {ANALYSIS_DATA.map((analysis, i) => (
            <button
              key={analysis.droneId}
              onClick={() => setActiveDroneIdx(i)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                activeDroneIdx === i 
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200" 
                  : "text-slate-500 hover:bg-white/50"
              )}
            >
              {analysis.droneId}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Video View */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative aspect-video rounded-3xl bg-slate-900 border-4 border-slate-900 shadow-2xl overflow-hidden group">
            <video
              ref={videoRef}
              src={currentAnalysis.videoSrc}
              className="w-full h-full object-cover"
              onTimeUpdate={handleTimeUpdate}
              loop
              muted
            />

            {/* Composite Overlay */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentAnalysis.droneId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 pointer-events-none"
              >
                {/* Bounding Boxes */}
                {currentAnalysis.detections.map((det) => (
                  <motion.div
                    key={det.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={cn(
                      "absolute border-2 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.5)]",
                      det.type === 'PERSON' ? "border-emerald-500 bg-emerald-500/10" :
                      det.type === 'BUILDING_DAMAGE' ? "border-amber-500 bg-amber-500/10" :
                      "border-red-500 bg-red-500/10"
                    )}
                    style={{
                      left: `${det.box[0]}%`,
                      top: `${det.box[1]}%`,
                      width: `${det.box[2]}%`,
                      height: `${det.box[3]}%`,
                    }}
                  >
                    <div className={cn(
                      "absolute -top-6 left-0 px-2 py-0.5 rounded text-[8px] font-black text-white whitespace-nowrap uppercase tracking-widest",
                      det.type === 'PERSON' ? "bg-emerald-500" :
                      det.type === 'BUILDING_DAMAGE' ? "bg-amber-500" :
                      "bg-red-500"
                    )}>
                      {det.type} {(det.confidence * 100).toFixed(0)}%
                    </div>
                  </motion.div>
                ))}

                {/* Scanning Effect Overlay */}
                <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay">
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-400/50 shadow-[0_0_20px_#60a5fa] animate-scan" />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Controls Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[1px]">
              <Button 
                onClick={togglePlay} 
                className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/40 border border-white/40 text-white backdrop-blur-md transition-transform active:scale-95"
              >
                {isPlaying ? <Pause className="w-8 h-8 fill-white" /> : <Play className="w-8 h-8 fill-white ml-1" />}
              </Button>
            </div>

            {/* Bottom HUD */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
              <div className="flex items-center gap-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live Analysis</span>
                </div>
                <div className="h-4 w-px bg-white/20" />
                <span className="text-[10px] font-bold text-white/70 uppercase tabular-nums">
                  00:{Math.floor(currentTime).toString().padStart(2, '0')} / 00:30
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="w-10 h-10 rounded-xl bg-black/60 border-white/10 text-white hover:bg-black/80">
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="w-10 h-10 rounded-xl bg-black/60 border-white/10 text-white hover:bg-black/80">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Detection Metadata Sidebar */}
        <div className="space-y-4 h-full">
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col h-full">
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Detection Feed</h5>
            <div className="space-y-3 overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
              <AnimatePresence mode="popLayout">
                {currentAnalysis.detections.map((det, i) => (
                  <motion.div
                    key={det.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 group cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={cn(
                        "text-[8px] font-black uppercase tracking-widest px-1.5 h-4",
                        det.type === 'PERSON' ? "bg-emerald-500" :
                        det.type === 'BUILDING_DAMAGE' ? "bg-amber-500" :
                        "bg-red-500"
                      )}>
                        {det.type}
                      </Badge>
                      <span className="text-[9px] font-bold text-slate-400 tabular-nums">{det.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold text-slate-700">Confidence</p>
                      <p className="text-[11px] font-black text-slate-900">{(det.confidence * 100).toFixed(1)}%</p>
                    </div>
                    <div className="mt-2 h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${det.confidence * 100}%` }}
                        className={cn(
                          "h-full rounded-full",
                          det.type === 'PERSON' ? "bg-emerald-500" :
                          det.type === 'BUILDING_DAMAGE' ? "bg-amber-500" :
                          "bg-red-500"
                        )}
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100">
              <Button className="w-full bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] h-10 rounded-xl">
                Export Analysis Log <ChevronRight className="w-3 h-3 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scan {
          from { top: 0%; }
          to { top: 100%; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
