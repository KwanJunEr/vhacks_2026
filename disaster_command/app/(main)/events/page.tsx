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
}

const initialEvents: DisasterEvent[] = [
  { 
    id: 'EV-001', 
    name: 'Sabah - Earthquake Alert', 
    location: 'Ranau District, Malaysia', 
    status: 'Critical', 
    reported: 'Just now', 
    description: 'Significant seismic activity detected near Ranau. Magnitude 6.2 confirmed. Immediate response required.',
  },
  { 
    id: 'EV-002', 
    name: 'Manila - Typhoon Warning', 
    location: 'Manila, Philippines', 
    status: 'Warning', 
    reported: '2h ago', 
    description: 'High wind speeds and heavy rainfall expected in Luzon area. Monitoring coastal surges.',
    impact: 'Red Alert Issued'
  },
  { 
    id: 'EV-003', 
    name: 'Jakarta - Flood Mitigation', 
    location: 'Jakarta, Indonesia', 
    status: 'Watch', 
    reported: '4h ago', 
    description: 'Water levels in Ciliwung river stabilizing. Drainage systems operating at max capacity.',
    impact: '3,400 Evacuated'
  },
  { 
    id: 'EV-004', 
    name: 'Bangkok - Urban Heatwave', 
    location: 'Bangkok, Thailand', 
    status: 'Resolved', 
    reported: 'Yesterday', 
    description: 'Temperature spikes mitigated through public cooling stations. Grid load stabilized.',
    impact: 'Normal Ops Resumed'
  },
  { 
    id: 'EV-005', 
    name: 'Ho Chi Minh City - Monsoon Alert', 
    location: 'Ho Chi Minh City, Vietnam', 
    status: 'Resolved', 
    reported: 'Yesterday', 
    description: 'Seasonal flooding controlled. Infrastructure damage minimal.',
    impact: 'Resolved'
  },
];

export default function EventsPage() {
  const [filter, setFilter] = useState('All');
  const [events] = useState(initialEvents);

  const filteredEvents = filter === 'All' 
    ? events 
    : events.filter(event => event.status === filter);

  const activeMissions = filteredEvents.filter(e => e.status === 'Critical');
  const pastMissions = filteredEvents.filter(e => e.status !== 'Critical');

  return (
    <div className="space-y-10">
      {/* Active Missions Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Active Missions
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </h1>
            <p className="text-slate-500 text-sm">Priority crisis events requiring immediate command attention.</p>
          </div>
          
          <div className="flex gap-2">
            {['All', 'Critical', 'Warning', 'Watch'].map((f) => (
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
          {activeMissions.length > 0 ? (
            activeMissions.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-500 text-sm font-medium">No active critical missions matching current filters.</p>
            </div>
          )}
        </div>
      </section>

      {/* Past Missions Section */}
      {pastMissions.length > 0 && (
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-700 tracking-tight">Recent & Past Missions</h2>
            <p className="text-slate-500 text-sm">Historical event data and monitored regional alerts.</p>
          </div>
          <div className="grid gap-4">
            {pastMissions.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function EventCard({ event }: { event: DisasterEvent }) {
  return (
    <Link href={`/events/${event.id}`}>
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
                  {event.id}
                </span>
                {event.status === 'Critical' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200 animate-pulse">
                        LIVE MISSION
                    </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {event.location}
                </span>
                <span className="text-xs text-slate-400 font-medium">Reported {event.reported}</span>
              </div>
              
              <p className="text-sm text-slate-600 line-clamp-1">{event.description}</p>
            </div>
          </div>

          {/* Right: Metrics */}
          <div className="flex items-center gap-6 md:w-1/4 justify-end">
            {/* Impact Badge */}
            {event.impact && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg shadow-sm group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                <BadgeCheck className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                <span className="text-xs font-medium text-slate-600 group-hover:text-blue-800">{event.impact}</span>
              </div>
            )}

            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors group-hover:translate-x-1 shrink-0" />
          </div>

        </div>
      </div>
    </Link>
  );
}
