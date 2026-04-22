"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type AICoordinationAccuracyPoint = {
  label: string;
  accuracy: number;
};

export function AICoordinationTrend() {
  const [data, setData] = useState<AICoordinationAccuracyPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccuracy = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai-coordination-accuracy`,
        );
        const json = await res.json();
        setData(Array.isArray(json?.data) ? json.data : []);
      } catch (error) {
        console.error("Failed to fetch AI coordination accuracy", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAccuracy();
  }, []);

  const latestAccuracy = data.at(-1)?.accuracy ?? 0;
  const startingAccuracy = data[0]?.accuracy ?? 0;
  const growth = useMemo(() => {
    if (data.length < 2) {
      return 0;
    }

    return latestAccuracy - startingAccuracy;
  }, [data, latestAccuracy, startingAccuracy]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-0.5">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            AI Coordination Accuracy
          </h4>
          <p className="text-[8px] font-bold text-emerald-600 tracking-tight">
            ↑ {growth.toFixed(1)}% improvement
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-slate-900">
            {latestAccuracy.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="flex-1 flex items-stretch gap-2 pb-2">
        {loading ? (
          <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/40 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Loading chart data
          </div>
        ) : (
          data.map((point, i) => (
            <div
              key={`${point.label}-${i}`}
              className="flex-1 flex flex-col items-center gap-2 group h-full"
            >
              <div className="w-full bg-slate-50/50 rounded-xl relative overflow-hidden flex-1 border border-slate-100/50">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.min(point.accuracy, 100)}%` }}
                  transition={{ duration: 1.2, delay: i * 0.1, ease: "easeOut" }}
                  className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 group-hover:from-blue-500 group-hover:to-blue-300 transition-all shadow-[0_-4px_12px_rgba(59,130,246,0.2)]"
                />
              </div>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                {point.label}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-900">
              {startingAccuracy.toFixed(1)}%
            </span>
            <span className="text-[8px] font-bold text-slate-400 uppercase">
              Start
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-emerald-600">+{growth.toFixed(1)}%</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase">
              Growth
            </span>
          </div>
        </div>
        <div className="px-2 py-0.5 bg-blue-50 border border-blue-100 rounded text-[8px] font-black text-blue-600 uppercase tracking-tighter">
          ML Optimized
        </div>
      </div>
    </motion.div>
  );
}
