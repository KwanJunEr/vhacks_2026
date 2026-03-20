"use client";

import React from "react";
import { motion } from "framer-motion";
import { Terminal, Cpu, Database, Network, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface MCPLog {
  id: string;
  timestamp: string;
  source: string;
  action: string;
  status: 'success' | 'processing' | 'error';
  details: string;
}

const mcpLogs: MCPLog[] = [
  {
    id: '1',
    timestamp: '14:20:05.122',
    source: 'SeismicSensor_Ranau_04',
    action: 'DATA_INGESTION',
    status: 'success',
    details: 'Primary P-wave detected. Amplitude: 4.2mm. Confidence: 0.99'
  },
  {
    id: '2',
    timestamp: '14:20:05.450',
    source: 'MCP_Coordinator',
    action: 'EVENT_CORRELATION',
    status: 'success',
    details: 'Triangulation complete. Epicenter: 5.9749° N, 116.6507° E (Ranau)'
  },
  {
    id: '3',
    timestamp: '14:20:06.100',
    source: 'AI_Impact_Predictor',
    action: 'MODEL_INFERENCE',
    status: 'success',
    details: 'Projected structural damage in Sector 4 (High). Est. 124 buildings impacted.'
  },
  {
    id: '4',
    timestamp: '14:20:07.890',
    source: 'Fleet_Manager',
    action: 'ASSET_ALLOCATION',
    status: 'success',
    details: 'Alpha-1, Alpha-2 dispatched. Estimated arrival: 120s.'
  },
  {
    id: '5',
    timestamp: '14:20:10.005',
    source: 'MCP_Log_Server',
    action: 'STATE_SYNCHRONIZATION',
    status: 'processing',
    details: 'Broadcasting mission parameters to ASEAN Regional Hub...'
  }
];

export function AITimeline() {
  return (
    <div className="flex h-full bg-slate-950 text-slate-300 font-mono text-[13px] overflow-hidden">
      {/* Sidebar: Decision Nodes */}
      <div className="w-64 border-r border-slate-800 bg-slate-900/50 p-6 overflow-y-auto">
        <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
          <Clock className="w-3 h-3" /> Decision Timeline
        </h3>
        
        <div className="space-y-8 relative">
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-800" />
          
          {[
            { time: "T+0s", event: "Trigger Ingested", icon: Database, color: "text-blue-400" },
            { time: "T+1.2s", event: "Pattern Match", icon: Network, color: "text-indigo-400" },
            { time: "T+2.5s", event: "Risk Assessment", icon: Cpu, color: "text-amber-400" },
            { time: "T+4.8s", event: "Mission Launch", icon: Terminal, color: "text-emerald-400" }
          ].map((node, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-8"
            >
              <div className={cn(
                "absolute left-0 top-1 w-6 h-6 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center z-10",
                node.color
              )}>
                <node.icon className="w-3 h-3" />
              </div>
              <p className="text-[10px] text-slate-500 font-bold mb-1">{node.time}</p>
              <p className="text-slate-200 font-bold tracking-tight">{node.event}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main: Raw MCP Logs */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-4 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase">
              MCP Protocol v2.4
            </div>
            <span className="text-slate-500 text-[11px]">Stream: RANAU_E_01</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase">Live Feed</span>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-4">
            {mcpLogs.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <div className="flex items-start gap-4">
                  <span className="text-slate-600 tabular-nums shrink-0 mt-1">{log.timestamp}</span>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 font-bold">{log.source}</span>
                      <ChevronRight className="w-3 h-3 text-slate-700" />
                      <span className="text-indigo-300 uppercase font-bold text-[11px]">{log.action}</span>
                      {log.status === 'processing' && (
                        <span className="w-2 h-2 border border-slate-600 border-t-blue-400 rounded-full animate-spin ml-2" />
                      )}
                    </div>
                    <div className="bg-slate-900/50 rounded p-2 border border-slate-800/50 group-hover:border-slate-700 transition-colors">
                      <p className="text-slate-400 leading-relaxed italic">
                        {log.details}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
