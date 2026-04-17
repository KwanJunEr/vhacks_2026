"use client";

import Link from "next/link";
import {
  BookOpenText,
  ShieldCheck,
  Siren,
  Building2,
  Ambulance,
  Radio,
  ArrowRight,
} from "lucide-react";

const sections = [
  {
    title: "Preparedness & Risk Mapping",
    summary:
      "Define hazard zones, evacuation corridors, and asset staging points before incidents occur.",
    bullets: [
      "Maintain updated hazard overlays for flood, seismic, landslide, and wildfire risks.",
      "Run pre-season readiness checks on shelters, fuel, batteries, and communications.",
      "Publish public-facing alert thresholds and escalation playbooks.",
    ],
  },
  {
    title: "Rapid Response Protocol",
    summary:
      "First 30 minutes determine survivability. Prioritize life-saving actions and command clarity.",
    bullets: [
      "Establish incident command and confirm a single communication channel.",
      "Deploy reconnaissance drones to validate hazards and route viability.",
      "Triangulate high-probability survivor sectors with thermal + visual feeds.",
    ],
  },
  {
    title: "Field Coordination",
    summary:
      "Synchronize drone, medical, and logistics units with live telemetry and mission checkpoints.",
    bullets: [
      "Assign roles per unit: rescue, medical support, relay, and perimeter scan.",
      "Use time-boxed objectives with automatic replan triggers every 2-5 minutes.",
      "Track battery, weather drift, and communication quality in one operational pane.",
    ],
  },
  {
    title: "Recovery & Reporting",
    summary:
      "Transition from acute response to restoration while preserving decision traceability.",
    bullets: [
      "Log mission decisions, confidence scores, and exceptions for audit.",
      "Publish infrastructure status for water, power, mobility, and healthcare.",
      "Deliver after-action report with timeline, cost, and response-time deltas.",
    ],
  },
];

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-xl border border-slate-200 bg-white/75 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Disaster Response Documentation
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Resources Center
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Operational reference for planning, response, coordination, and post-incident recovery.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            Ready for Deployment Review
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {sections.map((section) => (
          <article
            key={section.title}
            className="glass-panel rounded-xl border border-slate-200 bg-white/75 p-6"
          >
            <div className="mb-3 flex items-center gap-2 text-slate-900">
              <BookOpenText className="h-4 w-4 text-blue-600" />
              <h2 className="text-lg font-semibold">{section.title}</h2>
            </div>
            <p className="mb-4 text-sm text-slate-600">{section.summary}</p>
            <ul className="space-y-2 text-sm text-slate-700">
              {section.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <Siren className="mb-2 h-5 w-5 text-red-500" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Alert SOP</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">Tier 1-4 Escalation</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <Building2 className="mb-2 h-5 w-5 text-amber-500" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Infrastructure</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">Critical Site Checklist</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <Ambulance className="mb-2 h-5 w-5 text-emerald-500" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Medical</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">Triage Flow Cards</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <Radio className="mb-2 h-5 w-5 text-blue-500" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Comms</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">Fallback Channel Plan</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Back to Live Global Feed
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
