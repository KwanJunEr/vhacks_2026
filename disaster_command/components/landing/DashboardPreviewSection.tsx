"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Battery,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Icon } from "lucide-react";

export default function DashboardPreviewSection() {
  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
            Command Dashboard
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Mission Control Interface
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time visualization of grid status, drone fleet health, survivor
            detections, and MCP tool logs.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Mock Dashboard */}
          <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5 overflow-hidden">
            {/* Header Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  DisasterCommand Dashboard v2.4
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Live
                </span>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stats Cards */}
              <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  icon={Activity}
                  label="Active Drones"
                  value="12"
                  status="operational"
                />
                <StatCard
                  icon={MapPin}
                  label="Sectors Scanned"
                  value="47/64"
                  status="progress"
                />
                <StatCard
                  icon={Users}
                  label="Survivors Found"
                  value="23"
                  status="alert"
                />
                <StatCard
                  icon={Battery}
                  label="Avg Battery"
                  value="78%"
                  status="operational"
                />
              </div>

              {/* Drone List */}
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  Fleet Status
                </h4>
                <div className="space-y-2">
                  <DroneItem id="DR-001" status="scanning" battery={92} />
                  <DroneItem id="DR-002" status="moving" battery={85} />
                  <DroneItem id="DR-003" status="scanning" battery={67} />
                  <DroneItem id="DR-004" status="charging" battery={23} />
                </div>
              </div>

              {/* Grid Map Placeholder */}
              <div className="lg:col-span-2 rounded-xl border border-border bg-muted/20 p-4 h-48">
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  Sector Grid Map
                </h4>
                <div className="grid grid-cols-8 gap-1 h-32">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-sm ${
                        i < 47
                          ? "bg-primary/40"
                          : "bg-muted-foreground/10"
                      } ${
                        [12, 23, 34, 41, 55].includes(i)
                          ? "bg-red-400/60"
                          : ""
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* MCP Logs */}
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  MCP Tool Logs
                </h4>
                <div className="space-y-1.5 font-mono text-xs text-muted-foreground">
                  <LogEntry time="14:32:01" action="move_to(DR-001, S12)" />
                  <LogEntry time="14:32:03" action="thermal_scan(DR-002)" />
                  <LogEntry time="14:32:05" action="scan_area(DR-003, S23)" />
                  <LogEntry time="14:32:08" action="survivor_detected(S23)" />
                </div>
              </div>
            </div>
          </div>

          {/* Glow Effect */}
          <div className="absolute -inset-x-20 -bottom-20 h-40 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  status,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  status: "operational" | "progress" | "alert";
}) {
  const statusColors = {
    operational: "text-green-600",
    progress: "text-primary",
    alert: "text-orange-500",
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        
        <Icon className={`w-4 h-4 ${statusColors[status]}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className="text-2xl font-bold text-foreground">{value}</span>
    </div>
  );
}

function DroneItem({
  id,
  status,
  battery,
}: {
  id: string;
  status: "scanning" | "moving" | "charging";
  battery: number;
}) {
  const StatusIcon = status === "charging" ? AlertCircle : CheckCircle2;
  const statusColor =
    status === "charging"
      ? "text-yellow-500"
      : status === "scanning"
      ? "text-green-500"
      : "text-primary";

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <StatusIcon className={`w-3.5 h-3.5 ${statusColor}`} />
        <span className="font-medium text-foreground">{id}</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <span className="capitalize">{status}</span>
        <span className="text-foreground font-medium">{battery}%</span>
      </div>
    </div>
  );
}

function LogEntry({ time, action }: { time: string; action: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground/60">[{time}]</span>
      <span className="text-primary">{action}</span>
    </div>
  );
}
