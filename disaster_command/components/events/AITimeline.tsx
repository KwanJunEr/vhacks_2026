"use client";

import React from "react";
import { motion } from "framer-motion";
import { Terminal, Cpu, Database, Network, Clock, CheckCircle2, AlertTriangle, Activity } from "lucide-react";
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
    details: 'Primary P-wave detected. Amplitude: 4.2mm. Confidence: 0.99. Speed: 8.2km/s. Automatic trigger of Regional Disaster Protocol initiated.'
  },
  {
    id: '2',
    timestamp: '14:20:05.450',
    source: 'MCP_Coordinator',
    action: 'EVENT_CORRELATION',
    status: 'success',
    details: 'Cross-referencing multiple sensor nodes (RANAU_01, RANAU_04, KINABALU_02). Triangulation complete. Epicenter confirmed: 5.9749° N, 116.6507° E. Depth: 10km.'
  },
  {
    id: '3',
    timestamp: '14:20:06.100',
    source: 'AI_Impact_Predictor',
    action: 'MODEL_INFERENCE',
    status: 'success',
    details: 'Structural vulnerability model run for Ranau District. Projected damage in Sector 4: HIGH. Est. 124 buildings impacted. Population density data fetched: 450/sqkm.'
  },
  {
    id: '4',
    timestamp: '14:20:07.230',
    source: 'Map_Agent',
    action: 'STIGMERGY_INIT',
    status: 'success',
    details: 'Initializing 7x7 tactical grid overlay. Syncing real-time satellite terrain mapping. Setting Sector 4 as Priority Alpha zone.'
  },
  {
    id: '5',
    timestamp: '14:20:07.890',
    source: 'Fleet_Manager',
    action: 'ASSET_ALLOCATION',
    status: 'success',
    details: 'Executing list_available_drones() tool. Assets Alpha-1 through Alpha-4 assigned. Optimizing mission flight paths based on battery levels (Avg: 92%).'
  },
  {
    id: '6',
    timestamp: '14:20:08.450',
    source: 'Drone_Agent_A1',
    action: 'TOOL_EXECUTION',
    status: 'success',
    details: 'Alpha-1 executing move_to(A1). Battery cost: 5%. Altitude: 120m. Airspeed: 45km/h.'
  },
  {
    id: '7',
    timestamp: '14:20:10.005',
    source: 'MCP_Log_Server',
    action: 'STATE_SYNCHRONIZATION',
    status: 'success',
    details: 'Broadcasting live mission parameters to ASEAN Regional Humanitarian Hub. Encryption: AES-256-GCM_STIGMERGY. Latency: 42ms.'
  },
  {
    id: '8',
    timestamp: '14:20:15.320',
    source: 'Drone_Agent_A4',
    action: 'THERMAL_SCAN',
    status: 'success',
    details: 'Alpha-4 executing thermal_scan() in Sector 4. Heat signature detected (37.2°C). Confidence: 0.94. Cross-referencing with Map Agent stigmergy data.'
  },
  {
    id: '9',
    timestamp: '14:20:16.110',
    source: 'Detection_Agent',
    action: 'VICTIM_CONFIRMATION',
    status: 'success',
    details: 'AI confirmed human body heat signature in Grid 4D. Confidence: 0.91. Mission objective updated: Survivor Contact in progress.'
  },
  {
    id: '10',
    timestamp: '14:20:18.500',
    source: 'Command_Agent',
    action: 'REPLAN_TRIGGER',
    status: 'processing',
    details: 'Survivor found in Sector 4. Triggering immediate mission re-planning. Re-routing Alpha-2 and Alpha-3 to provide medical payload support.'
  }
];

export function AITimeline() {
  return (
    <div className="flex h-full bg-slate-950 text-slate-300 font-mono text-[13px] overflow-hidden">
      {/* Sidebar: Decision Nodes */}
      <div className="w-72 border-r border-slate-800 bg-slate-900/50 p-6 overflow-y-auto shrink-0">
        <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
          <Clock className="w-3 h-3" /> Decision Timeline
        </h3>
        
        <div className="space-y-8 relative">
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-800" />
          
          {[
            { time: "T+0s", event: "Seismic Trigger", icon: Database, color: "text-blue-400" },
            { time: "T+1.2s", event: "Epicenter Correlated", icon: Network, color: "text-indigo-400" },
            { time: "T+2.5s", event: "Structural Risk Analysis", icon: Cpu, color: "text-amber-400" },
            { time: "T+4.8s", event: "Swarm Mission Launch", icon: Terminal, color: "text-emerald-400" },
            { time: "T+15.2s", event: "Heat Signature Detection", icon: Activity, color: "text-red-400" }
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
        <div className="p-4 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase">
              MCP Protocol v2.4
            </div>
            <span className="text-slate-500 text-[11px]">Stream: SABAH_RANAU_E_01</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase">Live Feed</span>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
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
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 font-bold">{log.source}</span>
                      <ChevronRight className="w-3 h-3 text-slate-700" />
                      <span className="text-indigo-300 uppercase font-bold text-[11px]">{log.action}</span>
                      {log.status === 'processing' && (
                        <span className="w-2 h-2 border border-slate-600 border-t-blue-400 rounded-full animate-spin ml-2" />
                      )}
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/50 group-hover:border-slate-700 transition-colors">
                      <p className="text-slate-400 leading-relaxed italic text-[14px]">
                        "{log.details}"
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
