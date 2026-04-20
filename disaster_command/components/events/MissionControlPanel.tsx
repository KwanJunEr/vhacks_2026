"use client";

import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Terminal, Info, AlertTriangle, ShieldCheck, Activity, BrainCircuit, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'system' | 'ai';
  timestamp: string;
  showActions?: boolean;
}

interface MissionControlPanelProps {
  isDeployed: boolean;
  onDeploy: () => void;
  logs: LogEntry[];
  onNavigate: (tab: string) => void;
}

export function MissionControlPanel({ isDeployed, onDeploy, logs, onNavigate }: MissionControlPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [logs]);

  return (
    <div className="w-full h-full bg-slate-50/30 flex flex-col overflow-hidden">
      {/* Control Actions - Fixed at top */}
      <div className="p-6 border-b border-slate-200 bg-white shadow-sm shrink-0">
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

      {/* Activity Log Header - Fixed */}
      <div className="p-4 border-b border-slate-100 bg-white/50 flex items-center justify-between shrink-0">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5" /> Live Activity Log
        </h3>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Live Feed</span>
        </div>
      </div>
      
      {/* Scrollable Logs Area - Takes remaining space */}
      <div className="flex-1 min-h-0 relative">
        <ScrollArea className="h-full w-full" ref={scrollRef}>
          <div className="p-4 space-y-4 pb-10">
            {logs.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-xs text-slate-400 italic font-medium px-6">
                  No mission activity recorded. Start deployment to begin monitoring.
                </p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="animate-in slide-in-from-left duration-300">
                  <div className="flex gap-3 items-start group">
                    <div className={cn(
                      "mt-1.5 w-2 h-2 rounded-full flex-shrink-0 shadow-sm",
                      log.type === 'info' && "bg-blue-500",
                      log.type === 'warning' && "bg-amber-500 animate-pulse",
                      log.type === 'success' && "bg-emerald-500",
                      log.type === 'system' && "bg-slate-400",
                      log.type === 'ai' && "bg-indigo-500"
                    )} />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex justify-between items-start">
                        <p className={cn(
                          "text-[13px] font-bold leading-relaxed tracking-tight",
                          log.type === 'warning' ? "text-amber-700" : "text-slate-800",
                          log.type === 'success' ? "text-emerald-700" : "",
                          log.type === 'ai' ? "text-indigo-700" : ""
                        )}>
                          {log.message}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono tabular-nums bg-slate-100 px-1.5 py-0.5 rounded ml-2 shrink-0">{log.timestamp}</span>
                      </div>
                      
                      {log.showActions && (
                        <div className="flex gap-3 mt-3">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-9 text-[11px] font-bold uppercase tracking-wider gap-2 border-indigo-200 hover:bg-indigo-50 text-indigo-600 px-4"
                            onClick={() => onNavigate('reasoning')}
                          >
                            <BrainCircuit className="w-4 h-4" /> Reasoning
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-9 text-[11px] font-bold uppercase tracking-wider gap-2 border-blue-200 hover:bg-blue-50 text-blue-600 px-4"
                            onClick={() => onNavigate('timeline')}
                          >
                            <Clock className="w-4 h-4" /> Timeline
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Mission Meta - Fixed at bottom */}
      <div className="p-4 border-t border-slate-200 bg-white/50 shrink-0">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Encryption</span>
          <span className="text-blue-500 font-mono tracking-tighter">AES-256-GCM_STIGMERGY</span>
        </div>
      </div>
    </div>
  );
}
