"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Map as MapIcon, 
  MapPin, 
  AlertTriangle, 
  ChevronRight,
  Activity,
  Users,
  CheckCircle2,
  Scan,
  BadgeCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data structures
interface DisasterEvent {
  id: string;
  name: string;
  location: string;
  status: 'Critical' | 'Warning' | 'Watch' | 'Resolved';
  reported: string;
  description: string;
  impact?: string;
  progress?: number; // 0-100
}

const initialEvents: DisasterEvent[] = [
  { 
    id: '001', 
    name: 'Manila - Typhoon Warning', 
    location: 'Manila, Philippines', 
    status: 'Critical', 
    reported: '2m ago', 
    description: 'Significant seismic activity reported near coastal regions. Drone fleet 50% deployed.',
    progress: 45 // Initial progress
  },
  { 
    id: '002', 
    name: 'Tokyo - Seismic Aftermath', 
    location: 'Tokyo, Japan', 
    status: 'Warning', 
    reported: '2h ago', 
    description: 'Structure integrity checks ongoing. Search and rescue operations stabilizing.',
    impact: '12 Survivors Rescued'
  },
  { 
    id: '003', 
    name: 'Jakarta - Flood Alert', 
    location: 'Jakarta, Indonesia', 
    status: 'Watch', 
    reported: '4h ago', 
    description: 'Water levels receding. Deployment of sandbags effective.',
    impact: '3,400 Evacuated Safely'
  },
  { 
    id: '005', 
    name: 'Mexico City - Earthquake', 
    location: 'Mexico City, Mexico', 
    status: 'Resolved', 
    reported: 'Yesterday', 
    description: 'All critical infrastructure restored. Monitoring for aftershocks.',
    impact: '98% Grid Restored'
  },
];

export default function EventsPage() {
  const [filter, setFilter] = useState('All');
  const [events, setEvents] = useState(initialEvents);

  // Live Simulation Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setEvents(currentEvents => currentEvents.map(ev => {
        if (ev.status === 'Critical' && ev.progress !== undefined && ev.progress < 100) {
          // Increment progress slightly (0.1% to 0.5% per tick)
          const newProgress = Math.min(100, ev.progress + Math.random() * 0.4);
          return { ...ev, progress: newProgress };
        }
        return ev;
      }));
    }, 1500); // Update every 1.5s for "live" feel

    return () => clearInterval(interval);
  }, []);

  const filteredEvents = filter === 'All' 
    ? events 
    : events.filter(event => event.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
             Active Missions
             <span className="relative flex h-3 w-3">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
             </span>
           </h1>
           <p className="text-slate-500 text-sm">Real-time situational updates from global command.</p>
        </div>
        
        <div className="flex gap-2">
          {['All', 'Critical', 'Warning', 'Watch', 'Resolved'].map((f) => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={cn(
                 "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border shadow-sm",
                 filter === f 
                 ? 'text-white bg-blue-600 border-blue-600 shadow-blue-500/20' 
                 : 'text-slate-600 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900'
               )}
             >
               {f}
             </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredEvents.map((event) => (
          <Link key={event.id} href={`/dashboard/events/${event.id}`}>
            <div className="glass-panel p-5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all group relative overflow-hidden">
               {/* Status Line */}
               <div className={cn(
                 "absolute inset-y-0 left-0 w-1 transition-opacity", 
                 event.status === 'Critical' ? "bg-gradient-to-b from-red-500 to-transparent opacity-100" :
                 event.status === 'Resolved' ? "bg-gradient-to-b from-emerald-500 to-transparent opacity-50" :
                 "bg-gradient-to-b from-blue-500 to-transparent opacity-0 group-hover:opacity-100"
               )} />

               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                 
                 {/* Left: Icon & Info */}
                 <div className="flex items-start gap-4 flex-1">
                   <div className={cn(
                      "p-3 rounded-lg flex items-center justify-center shadow-sm shrink-0",
                      event.status === 'Critical' ? 'bg-red-50 text-red-600 border border-red-100' :
                      event.status === 'Warning' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                      event.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      'bg-blue-50 text-blue-600 border border-blue-100'
                   )}>
                     {event.status === 'Critical' ? <Activity className="w-6 h-6 animate-pulse" /> : 
                      event.status === 'Resolved' ? <CheckCircle2 className="w-6 h-6" /> :
                      <AlertTriangle className="w-6 h-6" />}
                   </div>
                   
                   <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-lg truncate">
                          {event.name}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-500 font-normal shadow-sm">
                          ID: {event.id}
                        </span>
                        {event.status === 'Critical' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200 animate-pulse">
                                LIVE
                            </span>
                        )}
                     </div>
                     
                     <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {event.location}
                        </span>
                     </div>
                     
                     <p className="text-sm text-slate-600 line-clamp-1">{event.description}</p>
                   </div>
                 </div>

                 {/* Right: Metrics & Progress */}
                 <div className="flex items-center gap-6 md:w-1/3 justify-end">
                    
                    {/* Active Progress Bar */}
                    {event.status === 'Critical' && event.progress !== undefined && (
                        <div className="flex-1 w-full space-y-2">
                             <div className="flex justify-between text-xs font-semibold">
                                 <span className="text-blue-600 flex items-center gap-1">
                                     <Scan className="w-3 h-3" /> Sector Scan
                                 </span>
                                 <span className="text-slate-900 tabular-nums">{event.progress.toFixed(1)}%</span>
                             </div>
                             <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                 <div 
                                    className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(37,99,235,0.2)]"
                                    style={{ width: `${event.progress}%` }}
                                 />
                             </div>
                        </div>
                    )}

                    {/* Impact Badge */}
                    {event.impact && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg shadow-sm">
                            <BadgeCheck className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-medium text-emerald-800">{event.impact}</span>
                        </div>
                    )}

                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors group-hover:translate-x-1 shrink-0" />
                 </div>

               </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
