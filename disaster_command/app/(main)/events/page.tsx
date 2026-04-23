"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  AlertTriangle,
  ChevronRight,
  Activity,
  CheckCircle2,
  BadgeCheck,
  Clock,
  RefreshCw,
  Loader2,
  Plane,
} from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

interface DisasterEvent {
  id: string;
  name: string;
  location: string;
  status: "Critical" | "Warning" | "Watch" | "Resolved" | string;
  event_time: string;
  last_updated: string;
  description?: string;
  impact?: string;
  is_active: number;
}

function formatRelative(isoStr: string): string {
  const date = new Date(isoStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

function formatDateTime(isoStr: string): string {
  const date = new Date(isoStr);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const STATUS_FILTERS = ["All", "Critical", "Warning", "Resolved"];

export default function EventsPage() {
  const [filter, setFilter] = useState("All");
  const [ongoingEvents, setOngoingEvents] = useState<DisasterEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<DisasterEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ongoingRes, pastRes] = await Promise.all([
        fetch(`${API_BASE}/api/disaster_events/ongoing`),
        fetch(`${API_BASE}/api/disaster_events/past`),
      ]);
      if (!ongoingRes.ok || !pastRes.ok) throw new Error("Failed to fetch events");
      const ongoingData = await ongoingRes.json();
      const pastData = await pastRes.json();
      setOngoingEvents(ongoingData.events ?? []);
      setPastEvents(pastData.events ?? []);
    } catch (err) {
      setError("Unable to load disaster events. Ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const applyFilter = (events: DisasterEvent[]) =>
    filter === "All" ? events : events.filter((e) => e.status === filter);

  const filteredOngoing = applyFilter(ongoingEvents);
  const filteredPast = applyFilter(pastEvents);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Disaster Events
            {ongoingEvents.length > 0 && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm">
            Real-time crisis monitoring across the region.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter buttons */}
          <div className="flex gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border shadow-sm",
                  filter === f
                    ? "text-white bg-blue-600 border-blue-600 shadow-blue-500/20"
                    : "text-slate-600 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={fetchEvents}
            disabled={loading}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-40"
            title="Refresh events"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading events…</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="text-center py-10 bg-red-50 rounded-xl border border-dashed border-red-200">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Active / Ongoing Missions */}
          <section className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Active Missions
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                  {filteredOngoing.length}
                </span>
              </h2>
              <p className="text-slate-500 text-sm">
                Priority crisis events requiring immediate command attention.
              </p>
            </div>

            <div className="grid gap-4">
              {filteredOngoing.length > 0 ? (
                filteredOngoing.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-slate-500 text-sm font-medium">
                    No active missions matching current filters.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Past / Resolved Missions */}
          {filteredPast.length > 0 && (
            <section className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-700 tracking-tight">
                  Recent &amp; Past Missions
                </h2>
                <p className="text-slate-500 text-sm">
                  Historical event data and resolved regional alerts.
                </p>
              </div>

              <div className="grid gap-4">
                {filteredPast.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function EventCard({ event }: { event: DisasterEvent }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/events/${event.id}`)}
      className="glass-panel p-5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all group relative overflow-hidden cursor-pointer"
    >
      {/* Left status stripe */}
      <div
        className={cn(
          "absolute inset-y-0 left-0 w-1 transition-opacity",
          event.status === "Critical"
            ? "bg-gradient-to-b from-red-500 to-transparent opacity-100"
            : event.status === "Resolved"
            ? "bg-gradient-to-b from-emerald-500 to-transparent opacity-60"
            : event.status === "Warning"
            ? "bg-gradient-to-b from-amber-500 to-transparent opacity-80"
            : "bg-gradient-to-b from-blue-500 to-transparent opacity-0 group-hover:opacity-100"
        )}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Icon + Info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div
            className={cn(
              "p-3 rounded-lg flex items-center justify-center shadow-sm shrink-0",
              event.status === "Critical"
                ? "bg-red-50 text-red-600 border border-red-100"
                : event.status === "Warning"
                ? "bg-orange-50 text-orange-600 border border-orange-100"
                : event.status === "Resolved"
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : "bg-blue-50 text-blue-600 border border-blue-100"
            )}
          >
            {event.status === "Critical" ? (
              <Activity className="w-6 h-6 animate-pulse" />
            ) : event.status === "Resolved" ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-lg truncate">
                {event.name}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-500 font-mono shadow-sm">
                {event.id}
              </span>
              {event.is_active === 1 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200 animate-pulse">
                  LIVE MISSION
                </span>
              )}
            </div>

            {/* Location + Timing */}
            <div className="flex items-center gap-4 text-sm text-slate-500 mb-2 flex-wrap">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {event.location}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                <Clock className="w-3 h-3" />
                {formatDateTime(event.event_time)}
              </span>
              <span className="text-xs text-slate-400">
                Updated {formatRelative(event.last_updated)}
              </span>
            </div>

            <p className="text-sm text-slate-600 line-clamp-1">
              {event.description}
            </p>
          </div>
        </div>

        {/* Right: status + impact + deploy button */}
        <div className="flex items-center gap-3 md:w-auto justify-end flex-shrink-0">
          <span
            className={cn(
              "text-xs font-semibold px-2.5 py-1 rounded-full border",
              event.status === "Critical"
                ? "bg-red-50 text-red-700 border-red-200"
                : event.status === "Warning"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : event.status === "Resolved"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
            )}
          >
            {event.status}
          </span>

          {event.impact && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg shadow-sm group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
              <BadgeCheck className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              <span className="text-xs font-medium text-slate-600 group-hover:text-blue-800">
                {event.impact}
              </span>
            </div>
          )}

          {event.status !== "Resolved" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/events/${event.id}`);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest shadow-md shadow-emerald-500/20 transition-colors shrink-0"
            >
              <Plane className="w-3.5 h-3.5" />
              Start Deployment
            </button>
          )}

          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors group-hover:translate-x-1 shrink-0" />
        </div>
      </div>
    </div>
  );
}
