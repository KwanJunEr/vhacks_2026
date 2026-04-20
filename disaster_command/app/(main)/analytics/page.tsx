"use client";

import React from "react";
import { 
  BarChart3, 
  Clock, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Zap, 
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          Mission Analytics
        </h1>
        <p className="text-slate-500 mt-2">Real-time performance metrics and historical impact analysis.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
         {/* Speed Card */}
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all duration-300">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Clock className="w-24 h-24 text-blue-600" />
             </div>
             <h3 className="text-slate-500 font-medium mb-2 flex items-center gap-2">
                Response Time <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">LIVE</span>
             </h3>
             <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-extrabold text-slate-900 tracking-tight">30s</span>
                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
                   <ArrowDownRight className="w-3 h-3" /> 90x FASTER
                </span>
             </div>
             <p className="text-sm text-slate-400">vs. 45 minutes traditional deployment</p>
         </div>

         {/* Lives Card */}
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all duration-300">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="w-24 h-24 text-amber-600" />
             </div>
             <h3 className="text-slate-500 font-medium mb-2">Survivors Located</h3>
             <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-extrabold text-slate-900 tracking-tight">8</span>
                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full flex items-center gap-1">
                   <Activity className="w-3 h-3" /> 100% SUCCESS
                </span>
             </div>
             <p className="text-sm text-slate-400">Precision geolocation within 1m</p>
         </div>

         {/* Cost Card */}
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all duration-300">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <DollarSign className="w-24 h-24 text-emerald-600" />
             </div>
             <h3 className="text-slate-500 font-medium mb-2">Operational Cost</h3>
             <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-extrabold text-slate-900 tracking-tight">$136</span>
                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
                   <ArrowDownRight className="w-3 h-3" /> 99.8% SAVINGS
                </span>
             </div>
             <p className="text-sm text-slate-400">vs. $58,400 traditional helicopter ops</p>
         </div>
      </div>

      {/* Visual Timeline Comparison */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm mb-8">
         <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" /> Efficiency Comparison
         </h3>
         
         <div className="space-y-12">
            {/* Traditional Timeline */}
            <div className="relative">
               <div className="flex justify-between text-sm font-semibold text-slate-500 mb-2">
                  <span>Traditional Response (Helicopter/Ground Team)</span>
                  <span>45 mins</span>
               </div>
               <div className="h-4 bg-slate-100 rounded-full w-full overflow-hidden flex relative">
                  <div className="h-full bg-slate-300 w-[20%]" /> {/* Mobilization */}
                  <div className="h-full bg-slate-400 w-[50%]" /> {/* Travel */}
                  <div className="h-full bg-slate-500 w-[30%] opacity-50" /> {/* Search */}
               </div>
               <div className="flex justify-between text-xs text-slate-400 mt-1 font-mono">
                  <span className="w-[20%]">Mobilization (15m)</span>
                  <span className="w-[50%] text-center">Travel (25m)</span>
                  <span className="w-[30%] text-right">Search (Start)</span>
               </div>
            </div>

            {/* Gemini AI Timeline */}
            <div>
               <div className="flex justify-between text-sm font-semibold text-blue-600 mb-2">
                  <span className="flex items-center gap-2 font-bold"><Zap className="w-4 h-4 fill-blue-600" /> Gemini Swarm Response</span>
                  <span className="animate-pulse font-bold">30 secs (DONE)</span>
               </div>
               <div className="h-10 bg-blue-50 rounded-full w-full relative overflow-visible flex items-center border border-blue-100">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full w-[2%] shadow-[0_0_20px_rgba(37,99,235,0.6)] relative group cursor-help transition-all duration-1000 ease-out hover:w-[5%]">
                     <div className="absolute right-0 -mr-2 top-1/2 -mt-7 bg-indigo-900 text-white text-[10px] font-bold px-3 py-1.5 rounded shadow-xl whitespace-nowrap z-10 flex flex-col items-center">
                        <span>MISSION COMPLETE</span>
                        <div className="w-2 h-2 bg-indigo-900 rotate-45 -mt-1 translate-y-2" />
                     </div>
                  </div>
               </div>
               <p className="text-xs text-blue-500 mt-2 font-medium">
                  Analysis completed before human teams could finish gearing up.
               </p>
            </div>
         </div>
      </div>

      {/* Lifetime Stats */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div>
                 <h4 className="font-bold text-2xl mb-2">Lifetime System Impact</h4>
                 <p className="text-indigo-200 text-sm max-w-md">Cumulative metrics across all deployed Gemini Disaster Response units since 2024.</p>
              </div>
              <div className="flex items-center gap-12 bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/10">
                 <div className="text-center">
                    <div className="text-4xl font-black text-white mb-1">102</div>
                    <div className="text-xs font-bold uppercase tracking-wide text-indigo-300">Lives Saved</div>
                 </div>
                 <div className="w-px h-12 bg-indigo-400/30" />
                 <div className="text-center">
                    <div className="text-4xl font-black text-emerald-400 mb-1">$742k</div>
                    <div className="text-xs font-bold uppercase tracking-wide text-emerald-400/80">Public Funds Saved</div>
                 </div>
              </div>
          </div>
      </div>
    </div>
  );
}