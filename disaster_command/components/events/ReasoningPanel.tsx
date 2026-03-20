"use client";

import React from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Target, ShieldCheck, Activity, Search, AlertTriangle, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ReasoningStep {
  id: number;
  title: string;
  description: string;
  confidence: number;
  status: 'complete' | 'processing' | 'pending';
  icon: any;
}

const reasoningSteps: ReasoningStep[] = [
  {
    id: 1,
    title: "Seismic Pattern Recognition",
    description: "Analyzing waveform signatures against historical Sabah earthquake data (2015 Mount Kinabalu Event). Identifying secondary tremor patterns.",
    confidence: 99.4,
    status: 'complete',
    icon: Activity
  },
  {
    id: 2,
    title: "Structural Vulnerability Assessment",
    description: "Cross-referencing Ranau District building permits with real-time satellite imaging. High-risk zones identified in Sector 4.",
    confidence: 88.2,
    status: 'complete',
    icon: Search
  },
  {
    id: 3,
    title: "Multi-Agent Mission Planning",
    description: "Calculating optimal drone flight paths based on wind speeds and battery efficiency. Sector 4 prioritized for immediate scout deployment.",
    confidence: 94.7,
    status: 'complete',
    icon: Target
  },
  {
    id: 4,
    title: "Resource Allocation Simulation",
    description: "Running Monte Carlo simulations for personnel arrival times. AI predicted arrival speed: 2.5 minutes (Human Avg: 18 minutes).",
    confidence: 96.1,
    status: 'processing',
    icon: BrainCircuit
  }
];

export function ReasoningPanel() {
  return (
    <div className="flex h-full bg-slate-50/30 overflow-hidden">
      {/* Left: Decision Logic */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-10">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">AI Decision Architecture</h3>
            <p className="text-slate-500 text-sm font-medium">Tracing the logic chain from detection to autonomous deployment.</p>
          </div>

          <div className="space-y-6 relative">
            <div className="absolute left-6 top-8 bottom-8 w-px bg-slate-200 border-dashed border-l" />
            
            {reasoningSteps.map((step, i) => (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="relative pl-16 group"
              >
                <div className={cn(
                  "absolute left-0 top-0 w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-500 z-10",
                  step.status === 'complete' ? "bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm" :
                  step.status === 'processing' ? "bg-blue-50 border-blue-400 text-blue-600 shadow-lg animate-pulse" :
                  "bg-slate-50 border-slate-200 text-slate-400"
                )}>
                  <step.icon className="w-6 h-6" />
                </div>

                <div className={cn(
                  "p-6 rounded-2xl border transition-all duration-300",
                  step.status === 'complete' ? "bg-white border-slate-200 group-hover:border-emerald-200 group-hover:shadow-md" :
                  step.status === 'processing' ? "bg-white border-blue-200 shadow-lg ring-4 ring-blue-50" :
                  "bg-slate-50 border-slate-100 opacity-60"
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-900">{step.title}</h4>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confidence</span>
                       <span className={cn(
                         "text-sm font-bold tabular-nums",
                         step.confidence > 95 ? "text-emerald-600" : "text-blue-600"
                       )}>{step.confidence}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6 font-medium italic">
                    "{step.description}"
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Inference Depth</span>
                      <span>Level 4/5</span>
                    </div>
                    <Progress value={step.confidence} className="h-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Summary Stats */}
      <div className="w-80 border-l border-slate-200 bg-white p-8 space-y-8 overflow-y-auto">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Inference Summary</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
               <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-slate-700">Model Response Time</span>
               </div>
               <p className="text-2xl font-bold text-slate-900">450ms</p>
               <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1">98% Faster than Human</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
               <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-700">Audit Status</span>
               </div>
               <p className="text-sm font-bold text-slate-900">Verified by MCP Protocol</p>
               <p className="text-[10px] text-slate-400 font-medium mt-1">Immutable Ledger ID: 8XF-001</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Explainability Matrix</h3>
          <div className="space-y-3">
             {[
               { label: 'Transparency', value: 98 },
               { label: 'Auditability', value: 100 },
               { label: 'Reliability', value: 96 }
             ].map((item, i) => (
               <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <Progress value={item.value} className="h-1 bg-slate-100" />
               </div>
             ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
          <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Autonomous Action</p>
          <p className="text-sm font-bold leading-snug">AI has authorized Alpha fleet launch with 99.1% confidence in detection accuracy.</p>
          <ArrowRight className="w-4 h-4 mt-4" />
        </div>
      </div>
    </div>
  );
}
