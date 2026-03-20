"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Download, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  Activity,
  Zap,
  ChevronRight,
  Info,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Synthetic Mission Data
const MISSION_REPORT = {
  id: "EV-001",
  title: "Sabah Earthquake Alert - Ranau District",
  date: "March 20, 2026",
  startTime: "08:12:45 UTC",
  duration: "1h 45m 12s",
  location: "Ranau, Sabah, Malaysia (6.01°N, 116.67°E)",
  severity: "CRITICAL",
  summary: "A magnitude 5.9 earthquake detected 10km north of Ranau. Rapid swarm deployment initiated at 08:15 UTC. Mission focused on life sign detection and structural integrity assessment in high-density residential zones.",
  stats: [
    { label: "Tactical Coverage", value: "94.2%", icon: Activity, color: "text-blue-500" },
    { label: "Detected Survivors", value: "12", icon: Users, color: "text-emerald-500" },
    { label: "Hazards Flagged", value: "45", icon: ShieldAlert, color: "text-rose-500" },
    { label: "AI Confidence", value: "98.4%", icon: Zap, color: "text-amber-500" },
  ],
  detections: [
    { sector: "D5", type: "Survivor", confidence: 0.98, time: "08:22", status: "Extracted" },
    { sector: "B2", type: "Structural Collapse", confidence: 0.92, time: "08:25", status: "Flagged" },
    { sector: "E4", type: "Survivor", confidence: 0.85, time: "08:31", status: "Assisting" },
    { sector: "A1", type: "Fire Hazard", confidence: 0.78, time: "08:35", status: "Monitored" },
    { sector: "G7", type: "Survivor", confidence: 0.94, time: "08:42", status: "Extracted" },
  ],
  droneFleet: [
    { id: "Alpha-1", model: "Scout-X", distance: "12.4km", batteryUsed: "65%", health: "98%" },
    { id: "Alpha-2", model: "Scout-X", distance: "10.8km", batteryUsed: "58%", health: "96%" },
    { id: "Alpha-3", model: "Heavy-Lift", distance: "8.2km", batteryUsed: "82%", health: "92%" },
    { id: "Alpha-4", model: "Heavy-Lift", distance: "9.5km", batteryUsed: "74%", health: "88%" },
  ]
};

export function ReportsPanel() {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);

    try {
      // Capture the element as a canvas
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Mission_Report_${MISSION_REPORT.id}_${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 h-full bg-slate-50/30 overflow-y-auto custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Post-Mission Reports</h3>
            <p className="text-slate-500 font-medium mt-1">Generated analytical summaries for emergency stakeholders.</p>
          </div>
          <Button 
            onClick={downloadPDF} 
            disabled={isGenerating}
            className="h-12 bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-xl shadow-blue-500/20 font-black px-6 uppercase tracking-widest text-[11px]"
          >
            {isGenerating ? (
              <span className="animate-pulse">Generating Report...</span>
            ) : (
              <>
                <Download className="w-4 h-4" /> Download Full PDF
              </>
            )}
          </Button>
        </div>

        {/* Report Document Preview */}
        <div 
          ref={reportRef}
          className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden text-slate-900 p-12 space-y-12"
        >
          {/* PDF Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8">
            <div className="space-y-2">
              <Badge className="bg-red-500 text-white font-black text-[10px] uppercase tracking-widest px-3 py-1 mb-2">
                OFFICIAL INCIDENT REPORT
              </Badge>
              <h1 className="text-4xl font-black tracking-tighter text-slate-900">{MISSION_REPORT.title}</h1>
              <div className="flex items-center gap-6 text-slate-500 font-bold text-sm">
                <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {MISSION_REPORT.date}</span>
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {MISSION_REPORT.location}</span>
                <span className="flex items-center gap-2 font-black text-blue-600">ID: {MISSION_REPORT.id}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white ml-auto mb-4">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ASEAN Disaster Command</p>
              <p className="text-xs font-bold text-slate-900">Sabah Response Center</p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {MISSION_REPORT.stats.map((stat, i) => (
              <div key={i} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-2">
                <div className={cn("p-2 rounded-xl bg-white border border-slate-100 w-fit", stat.color)}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mission Executive Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" /> Executive Summary
              </h2>
              <p className="text-slate-600 leading-relaxed font-medium text-lg">
                {MISSION_REPORT.summary}
              </p>
              
              <div className="space-y-4 pt-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Tactical Timeline</h3>
                <div className="space-y-3">
                  <div className="flex gap-4 items-start relative pl-6">
                    <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-blue-600" />
                    <div className="absolute left-[3.5px] top-4 bottom-[-16px] w-[1px] bg-slate-200" />
                    <span className="text-xs font-black text-slate-400 w-20 shrink-0">08:12 UTC</span>
                    <p className="text-sm font-bold text-slate-700">Seismic anomaly detected (M5.9). Triangulation complete.</p>
                  </div>
                  <div className="flex gap-4 items-start relative pl-6">
                    <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-blue-600" />
                    <div className="absolute left-[3.5px] top-4 bottom-[-16px] w-[1px] bg-slate-200" />
                    <span className="text-xs font-black text-slate-400 w-20 shrink-0">08:15 UTC</span>
                    <p className="text-sm font-bold text-slate-700">Alpha Swarm deployment authorized. MCP link established.</p>
                  </div>
                  <div className="flex gap-4 items-start relative pl-6">
                    <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-emerald-600 shadow-[0_0_8px_#10b981]" />
                    <span className="text-xs font-black text-slate-400 w-20 shrink-0">08:22 UTC</span>
                    <p className="text-sm font-bold text-slate-900">First victim confirmed in Sector D5. Thermal signature verified.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="p-8 rounded-[2rem] bg-slate-900 text-white space-y-6">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Performance Metrics</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] font-black uppercase mb-1.5">
                      <span>Inference Accuracy</span>
                      <span>98.4%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[98.4%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-black uppercase mb-1.5">
                      <span>Communication Sync</span>
                      <span>99.9%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[99.9%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-black uppercase mb-1.5">
                      <span>Autonomous Decision Speed</span>
                      <span>450ms</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 w-[92%]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-[2rem] bg-blue-50 border border-blue-100 space-y-4">
                 <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-blue-600" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Analyst Note</h4>
                 </div>
                 <p className="text-sm font-medium text-slate-600 italic leading-relaxed">
                   "Swarm intelligence demonstrated optimal stigmergy patterns. Victim extraction time reduced by 40% compared to manual SAR protocols."
                 </p>
              </div>
            </div>
          </div>

          {/* Detections & Assets Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
            <div className="space-y-6">
              <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                <Target className="w-5 h-5 text-rose-500" /> Critical Detections
              </h3>
              <div className="overflow-hidden rounded-3xl border border-slate-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Sector</th>
                      <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Type</th>
                      <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Confidence</th>
                      <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MISSION_REPORT.detections.map((det, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-black text-slate-900">{det.sector}</td>
                        <td className="px-6 py-4 font-bold text-slate-600">{det.type}</td>
                        <td className="px-6 py-4 font-black text-blue-600">{(det.confidence * 100).toFixed(0)}%</td>
                        <td className="px-6 py-4">
                          <Badge className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5",
                            det.status === 'Extracted' ? "bg-emerald-500" : "bg-blue-500"
                          )}>
                            {det.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                <Zap className="w-5 h-5 text-amber-500" /> Fleet Telemetry Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {MISSION_REPORT.droneFleet.map((drone, i) => (
                  <div key={i} className="p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 group">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{drone.id}</span>
                      <span className="text-[9px] font-black text-slate-400">{drone.model}</span>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-bold">
                         <span className="text-slate-500">Distance</span>
                         <span className="text-slate-900">{drone.distance}</span>
                       </div>
                       <div className="flex justify-between text-[10px] font-bold">
                         <span className="text-slate-500">Health</span>
                         <span className="text-emerald-600">{drone.health}</span>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PDF Footer */}
          <div className="border-t-2 border-slate-100 pt-8 flex justify-between items-center">
            <div className="text-[10px] font-bold text-slate-400">
              <p>© 2026 ASEAN Disaster Command Swarm Analytics</p>
              <p>Confidential Tactical Data - Authorized Personnel Only</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
              <CheckCircle2 className="w-4 h-4" /> Verified by MCP Integrity Engine
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
