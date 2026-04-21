"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  color: "red" | "blue" | "yellow" | "emerald" | "indigo" | "violet";
  index?: number;
  subValue?: string;
  subLabel?: string;
}

export function StatsCard({
  title,
  value,
  change,
  color,
  index = 0,
  subValue,
  subLabel,
}: StatsCardProps) {
  const getColors = () => {
    switch (color) {
      case "red":
        return "from-red-500 to-red-600 shadow-red-200";
      case "blue":
        return "from-blue-500 to-blue-600 shadow-blue-200";
      case "yellow":
        return "from-amber-400 to-amber-500 shadow-amber-200";
      case "indigo":
        return "from-indigo-500 to-indigo-600 shadow-indigo-200";
      case "violet":
        return "from-violet-500 to-violet-600 shadow-violet-200";
      default:
        return "from-emerald-500 to-emerald-600 shadow-emerald-200";
    }
  };

  const colorClasses = getColors();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        type: "spring",
        stiffness: 120,
      }}
      className="relative overflow-hidden p-6 rounded-2xl bg-white border border-slate-100 shadow-sm group hover:shadow-xl transition-all duration-300"
    >
      <div
        className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colorClasses}`}
      />

      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className="flex items-baseline justify-between mt-2">
          <span className="text-4xl font-black text-slate-900 tracking-tight">
            {value}
          </span>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">{change}</span>
          </div>
        </div>

        {subValue && (
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-black text-slate-800">
                {subValue}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                {subLabel}
              </span>
            </div>
            <div
              className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-tighter ${
                color === "red"
                  ? "bg-red-50 text-red-600"
                  : "bg-slate-50 text-slate-600"
              }`}
            >
              Resolved
            </div>
          </div>
        )}
      </div>

      <div
        className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity bg-gradient-to-br ${colorClasses}`}
      />
    </motion.div>
  );
}
