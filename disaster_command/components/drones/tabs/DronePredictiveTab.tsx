"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Wrench,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { DroneDetail } from "@/types/DroneDetails";

interface DronePredictiveTabProps {
  drone_name: string;
  last_maintenance?: string | null;
  last_updated?: string | null;
  battery_level?: number;
  health_status?: string | null;
  flight_controller?: number | null;
  gps_module?: number | null;
  data?: DroneDetail;
}

interface EvalResult {
  status: "pass" | "warn";
  score: number;
  title: string;
  summary: string;
  reasoning: string;
  items: { label: string; pass: boolean }[];
}

type EvalState = "idle" | "loading" | "done" | "error";

function formatDate(raw?: string | null) {
  if (!raw) return "—";
  try {
    return new Date(raw).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return raw;
  }
}

function daysSince(raw?: string | null) {
  if (!raw) return null;
  try {
    const ms = Date.now() - new Date(raw).getTime();
    return Math.floor(ms / 86400000);
  } catch {
    return null;
  }
}

function mockEvaluation(
  battery: number,
  health: string,
  fc?: number | null,
  gps?: number | null,
) {
  const overallScore = Math.round(((fc ?? 90) + (gps ?? 90) + battery) / 3);
  if (overallScore >= 80 && health !== "critical") {
    return {
      status: "pass",
      score: overallScore,
      title: "Drone Operational",
      summary:
        "All critical systems are within acceptable parameters. Drone is cleared for deployment.",
      items: [
        { label: "Flight readiness", pass: true },
        { label: "Battery reserve", pass: battery > 40 },
        { label: "Flight controller", pass: (fc ?? 0) >= 80 },
        { label: "GPS lock", pass: (gps ?? 0) >= 80 },
        { label: "Health status", pass: health !== "critical" },
      ],
    };
  }
  return {
    status: "warn",
    score: overallScore,
    title: "Maintenance Recommended",
    summary:
      "One or more systems are degraded. Schedule maintenance before next deployment.",
    items: [
      { label: "Flight readiness", pass: false },
      { label: "Battery reserve", pass: battery > 40 },
      { label: "Flight controller", pass: (fc ?? 0) >= 80 },
      { label: "GPS lock", pass: (gps ?? 0) >= 80 },
      { label: "Health status", pass: health !== "critical" },
    ],
  };
}

export default function DronePredictiveTab({
  drone_name,
  last_maintenance,
  last_updated,
  battery_level = 100,
  health_status = "optimal",
  flight_controller,
  gps_module,
  data,
}: DronePredictiveTabProps) {
  const [evalState, setEvalState] = useState<EvalState>("idle");
  const [evalResult, setEvalResult] = useState<EvalResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const daysMaintenance = daysSince(last_maintenance);

  const handleEvaluate = async () => {
    setEvalState("loading");
    setEvalResult(null);
    setErrorMsg(null);

    try {
      const payload = data ?? {
        drone_name,
        battery_level,
        health_status,
        flight_controller,
        gps_module,
        last_maintenance,
        last_updated,
      };
      const res = await fetch("/api/evaluate-drone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error ?? "Evaluation request failed");
      }

      const result: EvalResult = await res.json();
      setEvalResult(result);
      setEvalState("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setEvalState("error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Maintenance timeline */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm">
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <Wrench className="w-3.5 h-3.5" />
          Maintenance Timeline
        </h4>

        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Last Maintenance
              </p>
              <p className="text-sm font-bold text-slate-800">
                {formatDate(last_maintenance)}
              </p>
              {daysMaintenance != null && (
                <p
                  className={`text-[10px] font-bold mt-0.5 ${daysMaintenance > 30 ? "text-amber-600" : "text-emerald-600"}`}
                >
                  {daysMaintenance} days ago
                  {daysMaintenance > 30 && " — overdue"}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Last Updated
              </p>
              <p className="text-sm font-bold text-slate-800">
                {formatDate(last_updated)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluate button */}
      <button
        onClick={handleEvaluate}
        disabled={evalState === "loading"}
        className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          background:
            evalState === "loading"
              ? "linear-gradient(135deg, #334155, #1e293b)"
              : "linear-gradient(135deg, #3b82f6, #6366f1)",
          color: "#fff",
          boxShadow:
            evalState === "loading"
              ? "none"
              : "0 4px 24px rgba(99,102,241,0.35)",
        }}
      >
        {evalState === "loading" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Evaluating {drone_name}…
          </>
        ) : (
          <>
            <Wrench className="w-4 h-4" />
            Evaluate Drone
          </>
        )}
      </button>

      {/* Evaluation result */}
      <AnimatePresence>
        {evalState === "done" && evalResult && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className={`rounded-2xl border p-5 space-y-4 ${
              evalResult.status === "pass"
                ? "bg-emerald-50 border-emerald-200"
                : "bg-amber-50 border-amber-200"
            }`}
          >
            <div className="flex items-center gap-3">
              {evalResult.status === "pass" ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              )}
              <div>
                <p
                  className={`font-black text-sm ${evalResult.status === "pass" ? "text-emerald-800" : "text-amber-800"}`}
                >
                  {evalResult.title}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Score: {evalResult.score}/100
                </p>
              </div>
            </div>

            <p
              className={`text-xs font-medium ${evalResult.status === "pass" ? "text-emerald-700" : "text-amber-700"}`}
            >
              {evalResult.summary}
            </p>

            <div className="space-y-2">
              {evalResult.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${item.pass ? "bg-emerald-200" : "bg-red-200"}`}
                  >
                    <span className="text-[8px] font-black">
                      {item.pass ? "✓" : "✗"}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    {item.label}
                  </span>
                  <span
                    className={`ml-auto text-[10px] font-black ${item.pass ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {item.pass ? "Pass" : "Fail"}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-white/60 rounded-xl p-3 border border-slate-200 my-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">
                AI Reasoning
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">
                {evalResult.reasoning}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
