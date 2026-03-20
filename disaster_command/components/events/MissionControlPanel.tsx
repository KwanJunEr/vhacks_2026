"use client";

import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Terminal, Info, AlertTriangle, ShieldCheck, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'success' | 'system';
  timestamp: string;
}

interface MissionControlPanelProps {
  isDeployed: boolean;
  onDeploy: () => void;
  logs: LogEntry[];
}

export function MissionControlPanel({ isDeployed, onDeploy, logs }: MissionControlPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [logs]);

  return (
    <div className="w-full md:w-80 border-l border-slate-200 bg-slate-50/30 flex flex-col h-full">
      {/* Control Actions */}
      <div className="p-6 border-b border-slate-200 bg-white shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4" /> Mission Controls
        </h3>
        <Button 
          onClick={onDeploy} 
          disabled={isDeployed}
          className={cn(
            "w-full h-12 text-lg font-bold transition-all duration-300 shadow-md active:scale-95",
            isDeployed 
              ? "bg-slate-100 text-slate-400 border border-slate-200" 
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
          )}
        >
          {isDeployed ? (
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" /> Deployment Active
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Play className="w-5 h-5" /> Start Deployment
            </span>
          )}
        </Button>
      </div>

      {/* Activity Log */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-white/50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5" /> Live Activity Log
          </h3>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Live</span>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-xs text-slate-400 italic">No mission activity recorded. Start deployment to begin monitoring.</p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="animate-in slide-in-from-left duration-300">
                  <div className="flex gap-2 items-start group">
                    <div className={cn(
                      "mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0",
                      log.type === 'info' && "bg-blue-500",
                      log.type === 'warning' && "bg-amber-500 animate-pulse",
                      log.type === 'success' && "bg-emerald-500",
                      log.type === 'system' && "bg-slate-400"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-xs font-medium leading-relaxed tracking-tight",
                        log.type === 'warning' ? "text-amber-700" : "text-slate-700",
                        log.type === 'success' ? "text-emerald-700" : ""
                      )}>
                        {log.message}
                      </p>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">{log.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Mission Meta */}
      <div className="p-4 border-t border-slate-200 bg-white/50">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Encryption</span>
          <span className="text-blue-500">AES-256 Enabled</span>
        </div>
      </div>
    </div>
  );
}
