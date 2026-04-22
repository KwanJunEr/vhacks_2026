"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DroneCard from "./DroneCard";
import { Loader2, Search, Filter } from "lucide-react";

export function DroneFleetGrid() {
  const [drones, setDrones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchFleet = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/drones/detailed_fleet",
        );
        const data = await response.json();
        setDrones(data.drones || []);
      } catch (err) {
        console.error("Failed to fetch drone fleet:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFleet();
    const interval = setInterval(fetchFleet, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredDrones = drones.filter(
    (drone) =>
      drone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drone.id.includes(searchQuery) ||
      drone.brand.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <p className="text-[#00ff88] font-mono text-sm tracking-widest animate-pulse">
          SYNCHRONIZING SWARM DATA...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2a6644]" />
          <input
            type="text"
            placeholder="Search swarm by ID, Name or Brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a1a10] border border-[#0d2e18] rounded-xl py-3 pl-12 pr-4 text-[#e8fff4] text-sm focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/20 transition-all placeholder:text-[#1a3d24]"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#0a1a10] border border-[#0d2e18] rounded-xl text-[#aaccbb] text-xs font-bold hover:bg-[#0d2e18] transition-all">
            <Filter className="w-3.5 h-3.5" />
            FILTER STATUS
          </button>
          <div className="h-8 w-px bg-[#0d2e18]" />
          <span className="text-[#3a7755] text-[10px] font-bold uppercase tracking-widest">
            {filteredDrones.length} Assets Active
          </span>
        </div>
      </div>

      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      >
        <AnimatePresence>
          {filteredDrones.map((drone) => (
            <motion.div
              key={drone.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <DroneCard
                id={drone.id}
                name={drone.name}
                model={drone.model}
                brand={drone.brand}
                profile={drone.profile}
                battery={drone.battery}
                status={drone.status}
                health={drone.health}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
