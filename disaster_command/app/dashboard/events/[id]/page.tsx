"use client";

import React, { useState, use } from "react";
import { 
  MapPin, 
  Crosshair, 
  MessageSquare, 
  Terminal, 
  Activity, 
  Wifi, 
  Battery, 
  Cpu 
} from "lucide-react";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrapping params for Next.js 15+
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState("map");

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 text-sm text-slate-500 mb-1 font-medium">
             <span>Disaster Events</span>
             <span>/</span>
             <span className="text-slate-400">REF-{id.padStart(3, '0')}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Typhoon Warning - Manila sector
            <span className="px-2 py-0.5 rounded text-xs bg-red-50 text-red-600 border border-red-200 shadow-sm">CRITICAL</span>
          </h1>
        </div>
        <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-1 shadow-inner">
           {[
             { id: 'map', label: 'Live Map', icon: MapPin },
             { id: 'drones', label: 'Drone Fleet', icon: Crosshair },
             { id: 'agent', label: 'Agent Panel', icon: MessageSquare },
             { id: 'logs', label: 'MCP Logs', icon: Terminal },
           ].map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                 activeTab === tab.id 
                 ? 'bg-white text-blue-600 shadow-sm border border-slate-200' 
                 : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
               }`}
             >
               <tab.icon className="w-4 h-4" />
               <span className="hidden sm:inline">{tab.label}</span>
             </button>
           ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 glass-panel rounded-xl overflow-hidden border border-slate-200 relative bg-white shadow-sm">
        
        {/* Tab Content: MAP */}
        {activeTab === 'map' && (
          <div className="w-full h-full bg-slate-50 flex items-center justify-center relative overflow-hidden">
            {/* Map Grid Pattern Placeholder - Replacing failed mapbox image */}
            <div className="absolute inset-0 opacity-[0.03]" 
                 style={{ 
                    backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', 
                    backgroundSize: '40px 40px'
                 }} 
            />
            {/* Soft radial gradient for depth */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-50/50 to-slate-100/50 pointer-events-none" />
            
            {/* Overlay UI elements for Map */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur border border-slate-200 p-4 rounded-lg w-64 shadow-lg z-20">
               <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                 <Activity className="w-4 h-4 text-emerald-500" /> Live Sector Status
               </h3>
               <div className="space-y-2 text-xs text-slate-500">
                  <div className="flex justify-between"><span>Wind Speed</span> <span className="text-slate-900 font-medium">185 km/h</span></div>
                  <div className="flex justify-between"><span>Precipitation</span> <span className="text-slate-900 font-medium">45mm/h</span></div>
                  <div className="flex justify-between"><span>Affected Pop.</span> <span className="text-slate-900 font-medium">1.2M</span></div>
               </div>
            </div>
            
            <div className="z-10 text-center pointer-events-none">
               <div className="relative inline-block">
                 <MapPin className="w-12 h-12 text-red-600 mx-auto animate-bounce drop-shadow-xl relative z-10" />
                 <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/20 rounded-full blur-sm animate-pulse"></div>
               </div>
               <div className="mt-2 text-red-600 font-bold tracking-widest bg-white/90 px-3 py-1 rounded backdrop-blur border border-red-100 shadow-sm text-xs inline-block">EPICENTER</div>
            </div>
          </div>
        )}

        {/* Tab Content: DRONES */}
        {activeTab === 'drones' && (
           <div className="p-6 h-full flex flex-col bg-slate-50/50">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                   <div key={i} className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                            <Crosshair className="w-5 h-5" />
                         </div>
                         <div>
                            <div className="font-semibold text-slate-900">Drone-X{i}</div>
                            <div className="text-xs text-emerald-600 font-medium">Patroling Sector A</div>
                         </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-xs text-slate-500">
                         <div className="flex items-center gap-1"><Battery className="w-3 h-3 text-emerald-500" /> 84%</div>
                         <div className="flex items-center gap-1"><Wifi className="w-3 h-3 text-slate-400" /> Strong</div>
                      </div>
                   </div>
                ))}
             </div>
             
             <div className="mt-auto pt-6 border-t border-slate-200">
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-green-400 border border-slate-800 shadow-inner h-32 overflow-y-auto w-full">
                   <div>&gt; flight_controller initSequence --all</div>
                   <div>&gt; syncing telemetry... OK</div>
                   <div>&gt; establishing mesh network... OK</div>
                   <div>&gt; live feed uplink secured.</div>
                   <div>&gt; sensor calibration complete.</div>
                   <div className="animate-pulse">&gt; awaiting command...</div>
                </div>
             </div>
           </div>
        )}

        {/* Tab Content: AGENT */}
        {activeTab === 'agent' && (
           <div className="flex h-full flex-col md:flex-row">
              <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50 p-4">
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Active Agents</h3>
                 <div className="space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                    <div className="p-3 bg-white border border-blue-200 rounded-lg text-blue-700 text-sm font-medium flex items-center gap-2 shadow-sm whitespace-nowrap min-w-[140px] md:min-w-0">
                       <Cpu className="w-4 h-4 text-blue-500" /> Logistics AI
                    </div>
                    <div className="p-3 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-lg text-slate-600 text-sm font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap min-w-[140px] md:min-w-0">
                       <Cpu className="w-4 h-4 text-slate-400" /> Medical Triage
                    </div>
                 </div>
              </div>
              <div className="flex-1 flex flex-col bg-slate-50/30">
                 <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                    <div className="flex gap-3">
                       <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm text-white text-xs font-bold">AI</div>
                       <div className="bg-white border border-blue-100 rounded-2xl rounded-tl-none p-3 text-sm text-slate-800 max-w-lg shadow-sm">
                          Based on current wind patterns and population density, I recommend deploying Unit-4 to Sector 7 immediately. Evacuation routes are compromised in Sector 2.
                       </div>
                    </div>
                    <div className="flex gap-3 flex-row-reverse">
                       <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-1 text-slate-600 text-xs font-bold">CM</div>
                       <div className="bg-blue-50 border border-blue-100 rounded-2xl rounded-tr-none p-3 text-sm text-slate-800 max-w-lg">
                          Confirm deployment of Unit-4. Generate alternative routes for Sector 2.
                       </div>
                    </div>
                 </div>
                 <div className="p-4 border-t border-slate-200 bg-white">
                    <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                       <input type="text" placeholder="Type command for AI Agent..." className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm" />
                       <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm">Send</button>
                    </form>
                 </div>
              </div>
           </div>
        )}

        {/* Tab Content: LOGS */}
        {activeTab === 'logs' && (
           <div className="h-full bg-slate-50 p-4 font-mono text-xs overflow-y-auto border-l border-slate-200">
              <div className="space-y-1">
                 <div className="flex gap-2 text-slate-400 font-semibold border-b border-slate-200 pb-2 mb-2 uppercase tracking-wider">
                    <span className="w-24">Timestamp</span>
                    <span className="w-20">Level</span>
                    <span>System Message</span>
                 </div>
                 <div className="flex gap-2 hover:bg-white p-1 rounded transition-colors border-b border-slate-100 last:border-0">
                    <span className="text-slate-400 w-24">14:20:01</span> 
                    <span className="text-blue-600 font-bold w-20">INFO</span> 
                    <span className="text-slate-700">System initialization complete.</span>
                 </div>
                 <div className="flex gap-2 hover:bg-white p-1 rounded transition-colors border-b border-slate-100 last:border-0">
                    <span className="text-slate-400 w-24">14:20:05</span> 
                    <span className="text-purple-600 font-bold w-20">MCP</span> 
                    <span className="text-slate-700">Called tool: <span className="text-slate-900 font-semibold">analyze_terrain(lat=14.5, long=121.0)</span></span>
                 </div>
                 <div className="flex gap-2 hover:bg-white p-1 rounded transition-colors border-b border-slate-100 last:border-0">
                    <span className="text-slate-400 w-24">14:20:08</span> 
                    <span className="text-emerald-600 font-bold w-20">SUCCESS</span> 
                    <span className="text-slate-700">Terrain analysis data received. Risk factor: <span className="bg-red-100 text-red-700 px-1 rounded">HIGH</span>.</span>
                 </div>
                 <div className="flex gap-2 hover:bg-white p-1 rounded transition-colors border-b border-slate-100 last:border-0">
                    <span className="text-slate-400 w-24">14:21:12</span> 
                    <span className="text-purple-600 font-bold w-20">MCP</span> 
                    <span className="text-slate-700">Called tool: <span className="text-slate-900 font-semibold">dispatch_drone(id="DX-01", target="Sector 7")</span></span>
                 </div>
                 <div className="flex gap-2 hover:bg-white p-1 rounded transition-colors border-b border-slate-100 last:border-0">
                    <span className="text-slate-400 w-24">14:21:15</span> 
                    <span className="text-amber-600 font-bold w-20">WARN</span> 
                    <span className="text-slate-700">Drone DX-01 reporting high wind shear. Adjusting altitude.</span>
                 </div>
              </div>
           </div>
        )}

      </div>
    </div>
  );
}
