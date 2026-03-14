"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Map as MapIcon, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  ChevronRight 
} from "lucide-react";

const events = [
  { id: '001', name: 'Manila - Typhoon Warning', location: 'Manila, Philippines', status: 'Critical', reported: '2m ago', description: 'Significant seismic activity reported near coastal regions.' },
  { id: '002', name: 'Tokyo - Seismic Activity', location: 'Tokyo, Japan', status: 'Warning', reported: '15m ago', description: 'Minor tremors detected, structural integrity checks ongoing.' },
  { id: '003', name: 'Jakarta - Flood Alert', location: 'Jakarta, Indonesia', status: 'Watch', reported: '1h ago', description: 'Rising water levels in key districts, evacuation protocols initiated.' },
  { id: '004', name: 'California - Forest Fire', location: 'California, USA', status: 'Critical', reported: '2h ago', description: 'Rapidly spreading wildfire, air support requested.' },
  { id: '005', name: 'Mexico City - Earthquake', location: 'Mexico City, Mexico', status: 'Warning', reported: '3h ago', description: 'Moderate earthquake, no major damage reported.' },
];

export default function EventsPage() {
  const [filter, setFilter] = useState('All');

  const filteredEvents = filter === 'All' 
    ? events 
    : events.filter(event => event.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Active Disaster Events</h1>
        <div className="flex gap-2">
          {['All', 'Critical', 'Warning', 'Watch'].map((f) => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border shadow-sm ${
                 filter === f 
                 ? 'text-white bg-blue-600 border-blue-600 shadow-blue-500/20' 
                 : 'text-slate-600 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900'
               }`}
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
               <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="flex items-center justify-between">
                 <div className="flex items-start gap-4">
                   <div className={`p-3 rounded-lg flex items-center justify-center shadow-sm ${
                      event.status === 'Critical' ? 'bg-red-50 text-red-600 border border-red-100' :
                      event.status === 'Warning' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                      'bg-blue-50 text-blue-600 border border-blue-100'
                   }`}>
                     <AlertTriangle className="w-6 h-6" />
                   </div>
                   <div>
                     <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                       {event.name}
                       <span className="text-xs px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-500 font-normal shadow-sm">EVENT-{event.id}</span>
                     </h3>
                     <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {event.reported}
                        </span>
                     </div>
                     <p className="text-sm text-slate-600 mt-2 line-clamp-1">{event.description}</p>
                   </div>
                 </div>
                 <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors group-hover:translate-x-1" />
               </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
