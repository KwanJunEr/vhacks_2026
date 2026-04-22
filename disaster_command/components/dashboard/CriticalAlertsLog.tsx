"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCircle2, AlertCircle } from "lucide-react";

type FeedItem = {
  title: string;
  message: string | null;
  timestamp: string;
};

export function CriticalAlertsLog() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCriticalLog = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/critical-operations-log`,
        );
        const json = await res.json();
        setItems(Array.isArray(json?.items) ? json.items : []);
      } catch (error) {
        console.error("Failed to fetch critical operations log", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCriticalLog();
  }, []);

  const getAlertType = (index: number) => {
    if (index === 0) return "success";
    if (index === 1) return "critical";
    if (index === 2) return "warning";
    return "info";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">
          Critical Operations Log
        </h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Backend Feed
        </span>
      </div>

      <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[500px]">
        {loading ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/40 px-4 py-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Loading backend operations log
          </div>
        ) : items.length > 0 ? (
          items.map((alert, index) => (
          <motion.div
            key={`${alert.title}-${index}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-4 p-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors border border-slate-100/50 hover:border-slate-200"
          >
            <div
              className={`mt-1 shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                getAlertType(index) === "critical"
                  ? "bg-red-100 text-red-600"
                  : getAlertType(index) === "success"
                    ? "bg-emerald-100 text-emerald-600"
                    : getAlertType(index) === "warning"
                      ? "bg-amber-100 text-amber-600"
                      : "bg-blue-100 text-blue-600"
              }`}
            >
              {getAlertType(index) === "critical" ? (
                <AlertCircle className="w-4 h-4" />
              ) : getAlertType(index) === "success" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-bold text-slate-800">
                  {alert.title}
                </h4>
                <span className="text-[10px] font-bold text-slate-400">
                  {alert.timestamp}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {alert.message ?? "No additional details available."}
              </p>
            </div>
          </motion.div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/40 px-4 py-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
            No backend operations log available
          </div>
        )}
      </div>
    </motion.div>
  );
}
