"use client";

import React from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Target, ShieldCheck, Activity, Search, AlertTriangle, ArrowRight, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface ReasoningStep {
  id: number;
  title: string;
  description: string;
  confidence: number;
  status: 'complete' | 'processing' | 'pending';
  icon: any;
  dataSource: string;
  logic: string;
  conclusion: string;
}

const reasoningSteps: ReasoningStep[] = [
  {
    id: 1,
    title: "Seismic Waveform Triangulation",
    description: "Analyzing Ranau Station 14 data. Cross-referencing 2015 Sabah earthquake patterns. Identifying P-wave velocity at 8.2km/s. Confidence: 0.99.",
    confidence: 99.4,
    status: 'complete',
    icon: Activity,
    dataSource: "USGS / MetMalaysia Real-time Seismographs",
    logic: "Temporal analysis of waveform arrival times across 3 stations suggests epicenter depth of 10km.",
    conclusion: "Epicenter localized at Grid Sector 24 with 99.4% precision."
  },
  {
    id: 2,
    title: "Population Density Mapping",
    description: "Sector 4 identified as high-risk residential zone (450 people/sqkm). Structural vulnerability assessment of local building footprints underway.",
    confidence: 88.2,
    status: 'complete',
    icon: Search,
    dataSource: "WorldPop 2024 / OpenStreetMap Building Footprints",
    logic: "Overlaying seismic intensity map with population density data reveals highest risk in Sector 4 and surrounding quadrants.",
    conclusion: "Priority 1 search area established in Sectors 4, 11, 18, and 25."
  },
  {
    id: 3,
    title: "Stigmergy Mission Coordination",
    description: "Initializing multi-agent grid (7x7). Assigning Drones Alpha-1 to Alpha-4. Optimizing flight paths for battery longevity and maximum coverage speed.",
    confidence: 94.7,
    status: 'complete',
    icon: Target,
    dataSource: "Fleet Telemetry / Stigmergy Grid (Supabase)",
    logic: "Decentralized coordination using digital pheromones (stigmergy) ensures non-redundant scanning of 49 grid sectors.",
    conclusion: "Optimal fleet configuration: 4 drones, staggered launch intervals, 100% theoretical coverage in 12 minutes."
  },
  {
    id: 4,
    title: "Autonomous Deployment Authorization",
    description: "AI-led response authorized for Sabah District. Predicted personnel arrival: 2.5 minutes via optimized logistics agents. Manual override enabled.",
    confidence: 96.1,
    status: 'processing',
    icon: BrainCircuit,
    dataSource: "Command Agent (Gemini 1.5 Pro) / MCP Server",
    logic: "Multi-agent consensus achieved on high-probability life signs. Risk of structural collapse outweighs manual verification delay.",
    conclusion: "Full autonomous fleet deployment initiated. Responders alerted via SAR-Connect."
  }
];

export function ReasoningPanel() {
  return (
    <div className="flex h-full bg-slate-50/30 overflow-hidden">
      {/* Left: Decision Logic */}
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Decision Chain of Thought</h3>
            </div>
            <p className="text-slate-500 text-sm font-medium ml-11">Deep analytical breakdown of the autonomous decision-making process.</p>
          </div>

          <div className="space-y-8 relative">
            <div className="absolute left-6 top-8 bottom-8 w-px bg-slate-200 border-dashed border-l" />
            
            {reasoningSteps.map((step, i) => (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative pl-16 group"
              >
                {/* Connection Dot */}
                <div className={cn(
                  "absolute left-0 top-0 w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-500 z-10",
                  step.status === 'complete' ? "bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm" :
                  step.status === 'processing' ? "bg-blue-50 border-blue-400 text-blue-600 shadow-lg animate-pulse" :
                  "bg-slate-50 border-slate-200 text-slate-400"
                )}>
                  <step.icon className="w-6 h-6" />
                </div>

                <div className={cn(
                  "p-8 rounded-2xl border transition-all duration-300",
                  step.status === 'complete' ? "bg-white border-slate-200 group-hover:border-emerald-200 group-hover:shadow-md" :
                  step.status === 'processing' ? "bg-white border-blue-200 shadow-lg ring-4 ring-blue-50" :
                  "bg-slate-50 border-slate-100 opacity-60"
                )}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em]">Step {step.id}</span>
                      <h4 className="font-bold text-lg text-slate-900">{step.title}</h4>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confidence Level</span>
                       <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-xl font-black tabular-nums",
                          step.confidence > 95 ? "text-emerald-600" : "text-blue-600"
                        )}>{step.confidence}%</span>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(dot => (
                            <div key={dot} className={cn("w-1.5 h-3 rounded-full", dot <= Math.round(step.confidence/20) ? "bg-blue-500" : "bg-slate-100")} />
                          ))}
                        </div>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Observation</span>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                          "{step.description}"
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Data Source</span>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-[11px] font-bold text-slate-700">{step.dataSource}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Logical Reasoning</span>
                        <p className="text-[12px] text-slate-700 leading-relaxed font-medium">
                          {step.logic}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-2">Analytical Conclusion</span>
                        <p className="text-[12px] text-emerald-800 leading-relaxed font-bold">
                          {step.conclusion}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Analytical Metadata */}
      <div className="w-96 border-l border-slate-200 bg-white p-8 space-y-10 overflow-y-auto custom-scrollbar">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Analytical Metadata</h3>
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-200 transition-colors">
               <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Inference Latency</span>
               </div>
               <div className="flex items-baseline gap-2">
                 <p className="text-3xl font-black text-slate-900">450ms</p>
                 <span className="text-xs font-bold text-emerald-600">▲ 98% Opt.</span>
               </div>
               <p className="text-[10px] text-slate-400 font-medium mt-2 leading-relaxed">
                 Model performance exceeds real-time requirement threshold by 2.3x.
               </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-200 transition-colors">
               <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Verification Engine</span>
               </div>
               <p className="text-sm font-bold text-slate-900">MCP Protocol v2.1</p>
               <p className="text-[10px] text-slate-400 font-medium mt-1">Immutable Ledger: <span className="font-mono text-blue-600">SHA-256: 8XF...91Z</span></p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">MAS Explainability Matrix</h3>
          <div className="space-y-5">
             {[
               { label: 'Transparency', value: 98, color: 'bg-blue-500' },
               { label: 'Auditability', value: 100, color: 'bg-emerald-500' },
               { label: 'Reliability', value: 96, color: 'bg-indigo-500' },
               { label: 'Bias Detection', value: 99, color: 'bg-cyan-500' }
             ].map((item, i) => (
               <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <span>{item.label}</span>
                    <span className="text-slate-900">{item.value}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                      className={cn("h-full rounded-full", item.color)} 
                    />
                  </div>
               </div>
             ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Zap className="w-16 h-16" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 opacity-80">Autonomous Action</p>
          <p className="text-base font-bold leading-snug mb-6">
            AI has authorized Alpha fleet launch with 99.1% confidence. Priority: <span className="underline decoration-wavy decoration-emerald-400 underline-offset-4">CRITICAL</span>
          </p>
          <Button variant="secondary" className="w-full h-10 font-bold uppercase tracking-widest text-[11px] bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm">
            Review Protocol <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

