/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const defaultfleet = [
  { id: "D-01", status: "Active", battery: 84, mission: "Search" },
  { id: "D-02", status: "Active", battery: 62, mission: "Relay" },
  { id: "D-03", status: "Returning", battery: 18, mission: "Medical" },
  { id: "D-04", status: "Charging", battery: 45, mission: "Idle" },
  { id: "D-05", status: "Active", battery: 91, mission: "Survey" },
];

export function ActiveFleetManagement() {
  const [fleet, setFleet] = useState<any[]>(defaultfleet);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFleet = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/drones/detailed_fleet`
        );

        const data = await res.json();

        // ✅ SAFE GUARD (prevents crash)
        const drones = Array.isArray(data?.drones) ? data.drones : [];

        // ✅ Normalize backend → frontend format
        const formatted = drones.map((d: any, i: number) => ({
          id: d.id ?? d.drone_name ?? `D-${i + 1}`,
          name: d.name ?? "Alpha",
          status: d.status ?? "Unknown",
          battery: d.battery ?? d.battery_level ?? 0,

        }));

        // fallback if empty API response
        setFleet(formatted.length > 0 ? formatted : defaultfleet);
      } catch (err) {
        console.error("Failed to fetch fleet:", err);
        setFleet(defaultfleet); // fallback so UI never crashes
      } finally {
        setLoading(false);
      }
    };

    fetchFleet();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        Loading fleet...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full"
    >
      <h3 className="text-lg font-bold text-slate-900 mb-6">
        Fleet & Battery Health
      </h3>

      <div className="space-y-8">
        {fleet.map((drone, index) => (
          <div key={drone.id ?? index} className="group">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-slate-900 tracking-tighter">
                  {drone.id}
                </span>
                 <span className="text-xs font-black text-slate-900 tracking-tighter">
                  {drone.name}
                </span>

                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    drone.status === "Active"
                      ? "bg-emerald-50 text-emerald-600"
                      : drone.status === "Returning"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-slate-50 text-slate-400"
                  }`}
                >
                  {drone.status}
                </span>
              </div>

              <span
                className={`text-xs font-bold ${
                  drone.battery < 20
                    ? "text-red-500 animate-pulse"
                    : "text-slate-600"
                }`}
              >
                {drone.battery}%
              </span>
            </div>

            <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${drone.battery}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className={`h-full ${
                  drone.battery < 20
                    ? "bg-red-500"
                    : drone.battery < 50
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}