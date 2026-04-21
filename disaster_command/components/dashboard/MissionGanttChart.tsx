"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Calendar } from "lucide-react";

const eventsData = {
  "Earthquake - Jakarta 2026": [
    { task: "Initial Recon", start: 0, duration: 15, color: "bg-blue-400" },
    {
      task: "Survivor Locating",
      start: 10,
      duration: 35,
      color: "bg-emerald-400",
    },
    { task: "Mesh Deployment", start: 5, duration: 25, color: "bg-indigo-400" },
    { task: "Supply Drop", start: 30, duration: 20, color: "bg-amber-400" },
    {
      task: "Evacuation Support",
      start: 45,
      duration: 40,
      color: "bg-violet-400",
    },
  ],
  "Flood - Manila 2026": [
    { task: "Water Level Scan", start: 0, duration: 20, color: "bg-blue-400" },
    {
      task: "Rescue Coordination",
      start: 15,
      duration: 45,
      color: "bg-emerald-400",
    },
    {
      task: "Network Recovery",
      start: 10,
      duration: 30,
      color: "bg-indigo-400",
    },
    {
      task: "Medical Delivery",
      start: 40,
      duration: 25,
      color: "bg-amber-400",
    },
  ],
  "Wildfire - Sumatra 2026": [
    { task: "Thermal Mapping", start: 0, duration: 30, color: "bg-red-400" },
    {
      task: "Containment Monitoring",
      start: 20,
      duration: 50,
      color: "bg-orange-400",
    },
    {
      task: "Evacuation Routes",
      start: 15,
      duration: 35,
      color: "bg-indigo-400",
    },
    {
      task: "Supply Logistics",
      start: 45,
      duration: 15,
      color: "bg-amber-400",
    },
  ],
};

export function MissionGanttChart() {
  const [selectedEvent, setSelectedEvent] = useState(
    Object.keys(eventsData)[0],
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentTasks = eventsData[selectedEvent as keyof typeof eventsData];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col max-h-[300px]"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-base font-bold text-slate-900">
            Mission Timeline
          </h3>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
            Gantt Analysis
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all text-sm font-bold text-slate-700"
          >
            <Calendar className="w-4 h-4 text-blue-500" />
            {selectedEvent}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-100 shadow-xl rounded-xl z-50 py-2 overflow-hidden">
              {Object.keys(eventsData).map((event) => (
                <button
                  key={event}
                  onClick={() => {
                    setSelectedEvent(event);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${
                    selectedEvent === event
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {event}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-4">
        <div className="flex border-b border-slate-100 pb-2 mb-4">
          <div className="w-32 shrink-0 text-[10px] font-bold text-slate-400 uppercase">
            Operational Task
          </div>
          <div className="flex-1 flex justify-between px-2 text-[10px] font-bold text-slate-400 uppercase">
            <span>0h</span>
            <span>24h</span>
            <span>48h</span>
            <span>72h</span>
            <span>96h</span>
          </div>
        </div>

        <div className="space-y-6">
          {currentTasks.map((task, index) => (
            <div
              key={`${selectedEvent}-${task.task}`}
              className="flex items-center"
            >
              <div className="w-32 shrink-0 text-xs font-bold text-slate-600 truncate pr-4">
                {task.task}
              </div>
              <div className="flex-1 h-3 bg-slate-50 rounded-full relative overflow-hidden border border-slate-100/50">
                <motion.div
                  initial={{ width: 0, x: `${task.start}%` }}
                  animate={{ width: `${task.duration}%`, x: `${task.start}%` }}
                  transition={{
                    duration: 1,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 50,
                  }}
                  className={`absolute top-0 h-full rounded-full ${task.color} shadow-sm`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

     
    </motion.div>
  );
}
