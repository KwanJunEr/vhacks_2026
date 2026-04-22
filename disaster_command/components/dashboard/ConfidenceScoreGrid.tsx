"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

type ConfidenceMatrixItem = {
  label: string;
  value: number;
};

const scoreColors = [
  "text-red-500",
  "text-blue-500",
  "text-emerald-500",
  "text-indigo-500",
  "text-violet-500",
  "text-amber-500",
  "text-slate-500",
  "text-rose-500",
];

export function ConfidenceScoreGrid() {
  const [items, setItems] = useState<ConfidenceMatrixItem[] | null>(null);
  const [globalScore, setGlobalScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfidenceMatrix = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai-confidence-matrix`,
        );
        const json = await res.json();

        setItems(Array.isArray(json?.items) ? json.items : []);
        setGlobalScore(typeof json?.global_score === "number" ? json.global_score : 0);
      } catch (error) {
        console.error("Failed to fetch AI confidence matrix", error);
        setItems([]);
        setGlobalScore(0);
      } finally {
        setLoading(false);
      }
    };

    fetchConfidenceMatrix();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full"
    >
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold text-slate-900">AI Confidence Matrix</h3>
        <div className="flex flex-col items-end">
          <span className="text-2xl font-black text-blue-600">{(globalScore ?? 0).toFixed(1)}%</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global AI Score</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-10">
        {loading ? (
          <div className="col-span-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/40 px-4 py-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Loading backend confidence data
          </div>
        ) : items && items.length > 0 ? (
          items.map((score, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{score.label}</span>
                <span className={`text-sm font-black ${scoreColors[index % scoreColors.length]}`}>{score.value}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score.value}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className={`h-full bg-current ${scoreColors[index % scoreColors.length].replace('text-', 'bg-')}`}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/40 px-4 py-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
            No backend confidence data available
          </div>
        )}
      </div>
    </motion.div>
  );
}
