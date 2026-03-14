"use client";

import React from "react";
import { 
  FileText, 
  Download, 
  MapPin, 
  DollarSign, 
  Activity,
  Printer,
  Share2 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Mission Reports
          </h1>
          <p className="text-slate-500 mt-2">Automated post-action documentation and compliance filing.</p>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 transition-colors font-medium text-sm">
              <Printer className="w-4 h-4" /> Print
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors font-medium text-sm">
              <Download className="w-4 h-4" /> Export PDF
           </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-200/50 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center relative p-8">
         
         {/* Background pattern */}
         <div className="absolute inset-0 opacity-5 pointer-events-none" 
              style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
         />

         {/* The Paper Document */}
         <div className="bg-white w-full max-w-4xl aspect-[1/1.4] shadow-2xl rounded-sm p-16 relative overflow-y-auto transform scale-95 hover:scale-100 transition-transform duration-500 origin-center">
             
             {/* Report Header */}
             <div className="border-b-2 border-slate-900 pb-8 mb-12 flex justify-between items-start">
                <div>
                   <h1 className="text-4xl font-serif font-black text-slate-900 mb-2 tracking-tight">MISSION REPORT</h1>
                   <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">
                      REF-042-TYPHOON-MNL • {new Date().toLocaleDateString()}
                   </p>
                </div>
                <div className="text-right">
                   <div className="inline-block border-2 border-red-600 text-red-600 px-4 py-1 text-sm font-bold uppercase tracking-widest transform -rotate-2 mb-2">
                      CONFIDENTIAL
                   </div>
                   <div className="text-xs text-slate-400 font-mono">EYES ONLY • LVL 4 CLEARANCE</div>
                </div>
             </div>

             {/* Report Body */}
             <div className="space-y-12 font-serif text-slate-800">
                {/* Section 1 */}
                <section>
                   <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">1.0 Executive Summary</h3>
                   <div className="prose prose-slate max-w-none text-justify leading-relaxed">
                      <p>
                         At <span className="font-mono bg-slate-100 px-1 text-sm">14:30 UTC+8</span>, automated Gemini-class surveillance drones were deployed to Sector Manila-7 following localized typhoon warnings. 
                         The primary objective was rapid survivor geolocation in a hazardous urban environment.
                      </p>
                      <p className="mt-4">
                         <span className="bg-yellow-100 font-bold px-1 border-b-2 border-yellow-300">One (1) survivor was successfully identified</span> 
                         using multi-spectral thermal analysis with 99.9% confidence. Rescue coordinates have been automatically transmitted to ground response teams. 
                         The mission was completed in 30 seconds, representing a 98% reduction in response time compared to standard operating procedures.
                      </p>
                   </div>
                </section>
                
                {/* Section 2: Data Grid */}
                <section className="grid grid-cols-2 gap-12">
                   <div>
                      <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">2.0 Survivor Locations</h3>
                      <ul className="space-y-4 font-mono text-sm border-l-2 border-slate-900 pl-4">
                         <li className="flex justify-between items-center group cursor-pointer hover:bg-slate-50 p-2 -ml-2 rounded">
                            <span className="text-slate-500">Subject #001</span>
                            <span className="font-bold flex items-center gap-2">
                               <MapPin className="w-3 h-3 text-red-600" /> 
                               LAT: 14.5995° N
                            </span>
                         </li>
                         <li className="flex justify-between items-center p-2 -ml-2">
                             <span className="text-slate-500">Grid Sector</span>
                             <span className="font-bold">B2-ALPHA</span>
                         </li>
                         <li className="flex justify-between items-center p-2 -ml-2">
                            <span className="text-slate-500">Status</span>
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-bold rounded">RESCUE PENDING</span>
                         </li>
                      </ul>
                   </div>
                   <div>
                      <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">3.0 Cost Analysis</h3>
                       <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                          <ul className="space-y-3 text-sm font-sans">
                             <li className="flex justify-between text-slate-600">
                                <span>Fuel/Battery Consumption</span>
                                <span>$12.50</span>
                             </li>
                             <li className="flex justify-between text-slate-600">
                                <span>Data Processing (Cloud)</span>
                                <span>$4.30</span>
                             </li>
                             <li className="h-px bg-slate-300 my-2" />
                             <li className="flex justify-between font-bold text-slate-900 text-lg">
                                <span>Total Mission Cost</span>
                                <span>$16.80</span>
                             </li>
                          </ul>
                          <div className="mt-4 text-xs text-slate-400 text-center">
                             *Compared to $58,400 for helo deployment
                          </div>
                       </div>
                   </div>
                </section>

                {/* Section 3: Recommendations */}
                <section>
                   <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">4.0 AI Recommendations</h3>
                   <div className="bg-blue-50 p-6 rounded border-l-4 border-blue-500">
                      <p className="text-blue-900 font-medium italic text-sm leading-relaxed mb-2">
                         "Based on structural integrity analysis, immediate deployment of ground medical team is advised. Sector stability is compromising (85% probability of structural collapse within 2 hours)."
                      </p>
                      <div className="flex items-center gap-2 mt-4 text-xs font-bold text-blue-400 uppercase tracking-wide">
                         <Activity className="w-3 h-3" /> Gemini Command System • v2.4.1
                      </div>
                   </div>
                </section>
             </div>

             {/* Footer */}
             <div className="absolute bottom-16 left-16 right-16 text-center border-t border-slate-100 pt-8">
                <p className="text-[10px] text-slate-300 font-sans tracking-widest">
                   GENERATED AUTOMATICALLY BY GEMINI AI • DISASTER RESPONSE INITIATIVE 2026 • DO NOT DUPLICATE WITHOUT AUTHORIZATION
                </p>
             </div>
         </div>
      </div>
    </div>
  );
}