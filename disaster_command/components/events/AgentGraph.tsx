"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Network, 
  BrainCircuit, 
  Cpu, 
  Zap, 
  Map as MapIcon, 
  ShieldAlert, 
  UserSearch,
  MessageSquare,
  ArrowRightLeft,
  ChevronRight,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface AgentNode {
  id: string;
  name: string;
  role: string;
  icon: any;
  pos: { x: number; y: number };
  type: 'core' | 'agent' | 'analysis';
  color: string;
}

interface Connection {
  from: string;
  to: string;
  label: string;
  type: 'data' | 'command' | 'sync';
  weight: number;
}

const AGENTS: AgentNode[] = [
  { id: 'mcp', name: 'MCP Coordinator', role: 'Master Control Program', icon: Network, pos: { x: 50, y: 50 }, type: 'core', color: 'text-blue-500' },
  { id: 'command', name: 'Command Agent', role: 'Strategic Orchestration', icon: BrainCircuit, pos: { x: 50, y: 15 }, type: 'agent', color: 'text-purple-500' },
  { id: 'drone', name: 'Drone Agent', role: 'Fleet Controller', icon: Cpu, pos: { x: 50, y: 85 }, type: 'agent', color: 'text-indigo-500' },
  { id: 'map', name: 'Map Agent', role: 'Stigmergy Engine', icon: MapIcon, pos: { x: 15, y: 50 }, type: 'agent', color: 'text-emerald-500' },
  { id: 'damage', name: 'Structural Damage', role: 'Integrity Analysis', icon: ShieldAlert, pos: { x: 85, y: 35 }, type: 'analysis', color: 'text-amber-500' },
  { id: 'victim', name: 'Victim Detection', role: 'Human Search', icon: UserSearch, pos: { x: 85, y: 65 }, type: 'analysis', color: 'text-rose-500' },
];

const CONNECTIONS: Connection[] = [
  { from: 'command', to: 'mcp', label: 'Mission Params', type: 'command', weight: 3 },
  { from: 'mcp', to: 'drone', label: 'Tool Execution', type: 'command', weight: 3 },
  { from: 'drone', to: 'map', label: 'Sector Scan', type: 'data', weight: 2 },
  { from: 'map', to: 'mcp', label: 'Global State', type: 'sync', weight: 2 },
  { from: 'drone', to: 'damage', label: 'Video Feed', type: 'data', weight: 2 },
  { from: 'drone', to: 'victim', label: 'Thermal Feed', type: 'data', weight: 2 },
  { from: 'damage', to: 'command', label: 'Risk Score', type: 'sync', weight: 1 },
  { from: 'victim', to: 'command', label: 'Rescue Priority', type: 'sync', weight: 1 },
  { from: 'damage', to: 'map', label: 'Hazard Map', type: 'data', weight: 1 },
  { from: 'victim', to: 'map', label: 'Survivor Loc', type: 'data', weight: 1 },
  // Additional Interconnections for more "flowing" look
  { from: 'mcp', to: 'damage', label: 'Analysis Trigger', type: 'command', weight: 1 },
  { from: 'mcp', to: 'victim', label: 'Search Request', type: 'command', weight: 1 },
  { from: 'damage', to: 'victim', label: 'Structural Context', type: 'sync', weight: 1 },
];

export function AgentGraph() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredConn, setHoveredConn] = useState<number | null>(null);
  const [scale, setScale] = useState(1);

  // Interaction logs
  const logs = [
    { from: 'Drone Agent', to: 'Victim Detection', msg: 'Streaming Thermal-B2', time: 'Just now', type: 'data' },
    { from: 'Victim Detection', to: 'Command Agent', msg: 'Human signature confirmed D5', time: '2s ago', type: 'sync' },
    { from: 'Command Agent', to: 'MCP', msg: 'Redirecting Alpha-3 to D5', time: '5s ago', type: 'command' },
    { from: 'MCP', to: 'Drone Agent', msg: 'Executing move_to(D5)', time: '8s ago', type: 'command' },
    { from: 'Structural Damage', to: 'Map Agent', msg: 'Updating hazard sector E4', time: '12s ago', type: 'data' },
  ];

  const getPath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    // Offset the control point for a curve
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const offset = 10;
    const cx = midX - dy * (offset / 100);
    const cy = midY + dx * (offset / 100);
    return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
  };

  return (
    <TooltipProvider>
      <div className="flex h-full bg-slate-950 overflow-hidden relative select-none">
        {/* Graph Area */}
        <div className="flex-1 relative overflow-hidden bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.05)_0%,transparent_70%)]">
          {/* Zoom Controls */}
          <div className="absolute bottom-6 left-6 z-30 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
             <Button 
               variant="ghost" 
               size="icon" 
               className="w-8 h-8 rounded-lg text-slate-400 hover:text-white"
               onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
             >
               -
             </Button>
             <span className="text-[10px] font-black text-slate-500 w-8 text-center">{Math.round(scale * 100)}%</span>
             <Button 
               variant="ghost" 
               size="icon" 
               className="w-8 h-8 rounded-lg text-slate-400 hover:text-white"
               onClick={() => setScale(prev => Math.min(1.5, prev + 0.1))}
             >
               +
             </Button>
          </div>

          <motion.div 
            className="w-full h-full relative"
            style={{ scale }}
            drag
            dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
          >
            {/* SVG Background for Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                {/* Arrows */}
                <marker id="arrow-blue" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                </marker>
                <marker id="arrow-purple" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#a855f7" />
                </marker>
                <marker id="arrow-emerald" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                </marker>
              </defs>

              {CONNECTIONS.map((conn, i) => {
                const fromNode = AGENTS.find(a => a.id === conn.from);
                const toNode = AGENTS.find(a => a.id === conn.to);
                if (!fromNode || !toNode) return null;

                const isHighlighted = hoveredNode === conn.from || hoveredNode === conn.to || hoveredConn === i;
                const colorClass = conn.type === 'command' ? '#a855f7' : conn.type === 'data' ? '#3b82f6' : '#10b981';
                const markerId = `arrow-${conn.type === 'command' ? 'purple' : conn.type === 'data' ? 'blue' : 'emerald'}`;

                return (
                  <React.Fragment key={i}>
                    {/* Background Flow Path (Always Animated) */}
                    <motion.path
                      d={getPath(fromNode.pos, toNode.pos)}
                      fill="none"
                      stroke={colorClass}
                      strokeWidth={conn.weight * 0.5 + (isHighlighted ? 1 : 0)}
                      strokeOpacity={isHighlighted ? 0.9 : 0.4}
                      strokeDasharray="2 4"
                      markerEnd={`url(#${markerId})`}
                      animate={{
                        strokeDashoffset: [0, -100],
                      }}
                      transition={{
                        duration: 15 / conn.weight,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />

                    {/* High-Brightness Glow Path */}
                    <motion.path
                      d={getPath(fromNode.pos, toNode.pos)}
                      fill="none"
                      stroke={colorClass}
                      strokeWidth={conn.weight * 0.3}
                      strokeOpacity={isHighlighted ? 0.6 : 0.2}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: isHighlighted ? 0.6 : 0.2 }}
                      transition={{ duration: 1.5, delay: i * 0.1 }}
                      filter="url(#glow)"
                    />

                    {/* Flow Particles (Always Animated) */}
                    <motion.circle
                      r={isHighlighted ? 0.8 : 0.4}
                      fill={colorClass}
                      filter="url(#glow)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isHighlighted ? 1 : 0.7 }}
                    >
                      <animateMotion
                        dur={`${4 / (conn.weight || 1)}s`}
                        repeatCount="indefinite"
                        path={getPath(fromNode.pos, toNode.pos)}
                      />
                    </motion.circle>
                  </React.Fragment>
                );
              })}
            </svg>

            {/* Agents */}
            <div className="absolute inset-0">
              {AGENTS.map((agent, i) => (
                <Tooltip key={agent.id}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 100, delay: i * 0.1 }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                      style={{ left: `${agent.pos.x}%`, top: `${agent.pos.y}%` }}
                      onMouseEnter={() => setHoveredNode(agent.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      <div className={cn(
                        "w-20 h-20 rounded-3xl border-2 flex items-center justify-center transition-all duration-500 relative bg-slate-900",
                        hoveredNode === agent.id ? "border-white shadow-[0_0_40px_rgba(255,255,255,0.15)] scale-110" : "border-white/10",
                        agent.type === 'core' && "border-blue-500/50"
                      )}>
                        <agent.icon className={cn("w-10 h-10", agent.color)} />
                        
                        {/* Status Pulse */}
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>

                        {/* Outer Ring for Core */}
                        {agent.type === 'core' && (
                          <div className="absolute -inset-4 rounded-full border border-blue-500/10 animate-spin-slow pointer-events-none" />
                        )}
                      </div>
                      
                      <div className="absolute top-24 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                        <p className={cn(
                          "text-[10px] font-black uppercase tracking-[0.2em] mb-0.5",
                          hoveredNode === agent.id ? "text-white" : "text-slate-500"
                        )}>
                          {agent.name}
                        </p>
                        <p className="text-[8px] font-bold text-slate-700 uppercase">{agent.role}</p>
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-900 text-white border-white/10 p-4 rounded-xl shadow-2xl w-56">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 border-b border-white/10 pb-2">
                        <agent.icon className={cn("w-5 h-5", agent.color)} />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest">{agent.name}</p>
                          <p className="text-[8px] font-bold text-slate-500 uppercase">{agent.type} Module</p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                          <span>Uptime</span>
                          <span className="text-emerald-500">99.9%</span>
                        </div>
                        <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                          <span>Active Links</span>
                          <span className="text-blue-400">{CONNECTIONS.filter(c => c.from === agent.id || c.to === agent.id).length}</span>
                        </div>
                        <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                          <span>Status</span>
                          <span className="text-white">OPERATIONAL</span>
                        </div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Sidebar: Interaction Log */}
        <div className="w-96 border-l border-white/5 bg-slate-950/50 backdrop-blur-3xl p-8 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500" /> Multi-Agent Interaction
            </h3>
            <Badge className="bg-blue-600/10 text-blue-500 border-blue-500/20 text-[9px] font-black">LIVE</Badge>
          </div>

          <div className="space-y-6">
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative pl-6 group"
              >
                {/* Timeline Line */}
                {i !== logs.length - 1 && (
                  <div className="absolute left-[3px] top-6 bottom-[-24px] w-[1px] bg-white/5" />
                )}
                
                <div className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />

                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-white uppercase tracking-wider">{log.from}</span>
                      <ArrowRightLeft className="w-3 h-3 text-slate-600" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{log.to}</span>
                    </div>
                    <Badge className={cn(
                      "text-[8px] px-1.5 h-4 font-black",
                      log.type === 'command' ? "bg-purple-500/10 text-purple-400" :
                      log.type === 'data' ? "bg-blue-500/10 text-blue-400" :
                      "bg-emerald-500/10 text-emerald-400"
                    )}>
                      {log.type.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium italic">
                    "{log.msg}"
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-1">
                      {[1,2,3].map(dot => (
                        <div key={dot} className="w-1 h-1 rounded-full bg-blue-500/20" />
                      ))}
                    </div>
                    <span className="text-[9px] text-slate-600 font-bold uppercase tabular-nums">{log.time}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20">
             <div className="flex items-center gap-3 mb-4">
                <Target className="w-5 h-5 text-blue-400" />
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Global Objective</h4>
             </div>
             <p className="text-[11px] text-slate-400 leading-relaxed">
               Current swarm consensus: <span className="text-white font-bold">100% Coverage</span>. 
               Prioritizing <span className="text-rose-400 font-bold">Life Sign Verification</span> in Sector D5.
             </p>
             <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest h-10 rounded-xl">
               Sync Agent Logs <ChevronRight className="w-4 h-4 ml-2" />
             </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

