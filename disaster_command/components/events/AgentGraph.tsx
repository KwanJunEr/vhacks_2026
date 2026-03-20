"use client";

import React from "react";
import { motion } from "framer-motion";
import { Network, BrainCircuit, Cpu, Zap, Radio, ShieldCheck, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function AgentGraph() {
  const agents = [
    { id: 'mcp', name: 'MCP Coordinator', icon: Network, pos: { x: 50, y: 50 }, type: 'core' },
    { id: 'seismic', name: 'Seismic Analyst', icon: Activity, pos: { x: 20, y: 20 }, type: 'edge' },
    { id: 'fleet', name: 'Fleet Manager', icon: Cpu, pos: { x: 80, y: 20 }, type: 'edge' },
    { id: 'risk', name: 'Risk Predictor', icon: BrainCircuit, pos: { x: 20, y: 80 }, type: 'edge' },
    { id: 'comms', name: 'ASEAN Relay', icon: Radio, pos: { x: 80, y: 80 }, type: 'edge' },
  ];

  const connections = [
    { from: 'seismic', to: 'mcp' },
    { from: 'mcp', to: 'fleet' },
    { from: 'mcp', to: 'risk' },
    { from: 'mcp', to: 'comms' },
    { from: 'risk', to: 'fleet' },
  ];

  return (
    <div className="flex h-full bg-slate-900 overflow-hidden relative">
      {/* SVG Background for Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {connections.map((conn, i) => {
          const fromAgent = agents.find(a => a.id === conn.from);
          const toAgent = agents.find(a => a.id === conn.to);
          if (!fromAgent || !toAgent) return null;
          
          return (
            <motion.line
              key={i}
              x1={`${fromAgent.pos.x}%`}
              y1={`${fromAgent.pos.y}%`}
              x2={`${toAgent.pos.x}%`}
              y2={`${toAgent.pos.y}%`}
              stroke="currentColor"
              strokeWidth="1"
              className="text-blue-500/30"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, delay: i * 0.2 }}
            />
          );
        })}
      </svg>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Agents */}
      <div className="flex-1 relative">
        {agents.map((agent, i) => (
          <motion.div
            key={agent.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, delay: i * 0.1 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{ left: `${agent.pos.x}%`, top: `${agent.pos.y}%` }}
          >
            <div className={cn(
              "w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 relative",
              agent.type === 'core' 
                ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)]" 
                : "bg-slate-800 border-slate-700 text-slate-400 group-hover:border-blue-500 group-hover:text-blue-400"
            )}>
              <agent.icon className="w-8 h-8" />
              
              {/* Ping Animation for Core */}
              {agent.type === 'core' && (
                <div className="absolute inset-0 rounded-2xl bg-blue-400 animate-ping opacity-20" />
              )}
            </div>
            
            <div className="absolute top-20 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
              <p className={cn(
                "text-[11px] font-bold uppercase tracking-widest",
                agent.type === 'core' ? "text-blue-400" : "text-slate-500"
              )}>
                {agent.name}
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">Active</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Right Sidebar: Interaction Log */}
      <div className="w-80 border-l border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 overflow-y-auto">
        <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-6">Agent Interactions</h3>
        <div className="space-y-4">
          {[
            { from: 'Seismic Analyst', to: 'MCP', msg: 'Broadcasting waveform Ref: SB-44', time: 'Just now' },
            { from: 'MCP', to: 'Risk Predictor', msg: 'Requesting impact inference', time: '2s ago' },
            { from: 'Risk Predictor', to: 'Fleet Manager', msg: 'Authorized Alpha deployment', time: '5s ago' },
            { from: 'MCP', to: 'ASEAN Relay', msg: 'Mission parameters synced', time: '12s ago' },
          ].map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold text-blue-400">{log.from}</span>
                <Zap className="w-2.5 h-2.5 text-slate-600" />
                <span className="text-[10px] font-bold text-indigo-400">{log.to}</span>
              </div>
              <p className="text-[11px] text-slate-400 italic">"{log.msg}"</p>
              <p className="text-[9px] text-slate-600 mt-2 text-right uppercase font-bold">{log.time}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
