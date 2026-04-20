"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon, ArrowUpRight } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: LucideIcon;
  color: 'red' | 'blue' | 'yellow' | 'emerald' | 'indigo';
  index?: number;
}

export function StatsCard({ title, value, change, icon: Icon, color, index = 0 }: StatsCardProps) {
  const getColors = () => {
    switch(color) {
      case 'red': return { icon: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' };
      case 'blue': return { icon: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' };
      case 'yellow': return { icon: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' };
      case 'indigo': return { icon: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100' };
      default: return { icon: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' };
    }
  };
  
  const colors = getColors();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100 
      }}
      className="glass-panel p-6 rounded-xl border border-slate-200 relative overflow-hidden group hover:border-blue-300 hover:shadow-lg transition-all duration-300 bg-white/70"
    >
      <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${colors.icon}`}>
        <Icon className="w-16 h-16" />
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-lg ${colors.bg} ${colors.icon} shadow-sm`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-sm font-medium text-slate-500">{title}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        <span className="text-xs font-medium text-emerald-600 flex items-center bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
          <ArrowUpRight className="w-3 h-3 mr-1" />
          {change}
        </span>
      </div>
    </motion.div>
  );
}
