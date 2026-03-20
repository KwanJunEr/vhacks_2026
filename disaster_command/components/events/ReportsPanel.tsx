"use client";

import React from "react";
import { FileText, Download, Clock, CheckCircle2, User, MapPin, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function ReportsPanel() {
  const reports = [
    {
      id: "REP-001",
      title: "Initial Seismic Impact Report",
      date: "Just now",
      author: "System AI",
      status: "Finalized",
      type: "Situation Report"
    },
    {
      id: "REP-002",
      title: "Drone Fleet Alpha-1 Deployment Log",
      date: "2m ago",
      author: "Fleet Manager Agent",
      status: "Finalized",
      type: "Asset Log"
    },
    {
      id: "REP-003",
      title: "Ranau District Vulnerability Analysis",
      date: "15m ago",
      author: "Regional Analyst Agent",
      status: "Finalized",
      type: "Risk Assessment"
    }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Mission Reports</h3>
          <p className="text-slate-500 font-medium">Immutable documentation and AI-generated analysis logs.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Download className="w-4 h-4" /> Export All Data
        </Button>
      </div>

      <div className="grid gap-6">
        {reports.map((report) => (
          <div key={report.id} className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{report.title}</h4>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 uppercase">{report.id}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {report.date}</span>
                    <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {report.author}</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {report.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="gap-2 text-slate-600">
                  <Share2 className="w-3.5 h-3.5" /> Share
                </Button>
                <Button variant="outline" size="sm" className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <FileText className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <h4 className="text-xl font-bold mb-2">Automated Briefing Generation</h4>
          <p className="text-slate-400 text-sm max-w-xl mb-6">AI is currently synthesizing real-time sensor data and drone telemetry to generate a comprehensive Situation Report (SITREP) for the ASEAN Humanitarian Assistance (AHA) Centre.</p>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                  AI
                </div>
              ))}
            </div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">3 Agents Collaborating</span>
          </div>
        </div>
      </div>
    </div>
  );
}
