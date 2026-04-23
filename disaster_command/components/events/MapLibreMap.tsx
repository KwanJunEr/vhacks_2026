"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { GridDrone, GridEntity } from "./ThreeJSGrid";

interface MapboxMapProps {
  drones: GridDrone[];
  entities: GridEntity[];
}

// ─── Map config: Kota Kinabalu, Sabah ─────────────────────────────────────────
const MAP_CENTER: [number, number] = [116.0735, 5.9804];
const MAP_ZOOM = 13;

const GRID_SIZE_DEG = 0.035;
const GRID = 20;

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";

// ─── Coordinate helpers ───────────────────────────────────────────────────────

function cellToLngLat(gx: number, gy: number): [number, number] {
  const lng = MAP_CENTER[0] - GRID_SIZE_DEG / 2 + (gx / GRID) * GRID_SIZE_DEG;
  const lat = MAP_CENTER[1] + GRID_SIZE_DEG / 2 - (gy / GRID) * GRID_SIZE_DEG;
  return [lng, lat];
}

function droneToLngLat(cx: number, cy: number): [number, number] {
  const gx = Math.min(19, Math.max(0, (cx / 100) * 19));
  const gy = Math.min(19, Math.max(0, (cy / 100) * 19));
  return cellToLngLat(gx, gy);
}

// ─── Styling constants ────────────────────────────────────────────────────────

const ENTITY_COLORS: Record<string, string> = {
  survivor: "#ef4444",
  hazard: "#fbbf24",
  supply: "#10b981",
  recharge_station: "#60a5fa",
};

const ENTITY_EMOJIS: Record<string, string> = {
  survivor: "🧍",
  hazard: "⚠️",
  supply: "📦",
  recharge_station: "⚡",
};

const DRONE_COLORS: Record<string, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#eab308",
  purple: "#a855f7",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface TooltipState {
  x: number;
  y: number;
  title: string;
  rows: { label: string; value: string; color?: string }[];
}

// ─── Public Component ─────────────────────────────────────────────────────────

export function MapLibreMap({ drones, entities }: MapboxMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const setTooltipRef = useRef(setTooltip);
  setTooltipRef.current = setTooltip;

  // ── Grid overlay canvas ──────────────────────────────────────────────────────

  const drawGrid = () => {
    const canvas = canvasRef.current;
    const map = mapRef.current;
    if (!canvas || !map) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const tl = map.project(cellToLngLat(0, 0));
    const br = map.project(cellToLngLat(GRID, GRID));

    const x0 = tl.x;
    const y0 = tl.y;
    const w = br.x - tl.x;
    const h = br.y - tl.y;
    const cw = w / GRID;
    const ch = h / GRID;

    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        ctx.fillStyle =
          (r + c) % 2 === 0
            ? "rgba(30,41,59,0.20)"
            : "rgba(15,23,42,0.12)";
        ctx.fillRect(x0 + c * cw, y0 + r * ch, cw, ch);
      }
    }

    ctx.strokeStyle = "rgba(99,102,241,0.38)";
    ctx.lineWidth = 0.6;
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(x0 + i * cw, y0);
      ctx.lineTo(x0 + i * cw, y0 + h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x0, y0 + i * ch);
      ctx.lineTo(x0 + w, y0 + i * ch);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(99,102,241,0.85)";
    ctx.lineWidth = 1.8;
    ctx.strokeRect(x0, y0, w, h);

    const bLen = Math.min(cw * 2.5, 28);
    ctx.strokeStyle = "rgba(56,189,248,0.9)";
    ctx.lineWidth = 2.2;
    (
      [
        [x0, y0, 1, 1],
        [x0 + w, y0, -1, 1],
        [x0, y0 + h, 1, -1],
        [x0 + w, y0 + h, -1, -1],
      ] as [number, number, number, number][]
    ).forEach(([cx, cy, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(cx + dx * bLen, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + dy * bLen);
      ctx.stroke();
    });

    ctx.fillStyle = "rgba(148,163,184,0.8)";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    for (let i = 0; i <= GRID; i += 5) {
      ctx.fillText(String(i), x0 + i * cw, y0 - 5);
      ctx.textAlign = "right";
      ctx.fillText(String(i), x0 - 5, y0 + i * ch + 4);
      ctx.textAlign = "center";
    }
  };

  // ── Map init ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!containerRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAPBOX_TOKEN ? "mapbox://styles/mapbox/dark-v11" : {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm", paint: { "raster-opacity": 0.8 } }],
      },
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
    });

    mapRef.current = map;

    const resizeCanvas = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.offsetWidth;
        canvasRef.current.height = containerRef.current.offsetHeight;
      }
    };

    map.on("load", () => {
      resizeCanvas();
      drawGrid();
      addMarkers(mapboxgl);
    });

    map.on("move", drawGrid);
    map.on("zoom", drawGrid);
    map.on("resize", () => {
      resizeCanvas();
      drawGrid();
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Update markers when data changes ─────────────────────────────────────────

  useEffect(() => {
    if (!mapRef.current) return;
    addMarkers(mapboxgl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drones, entities]);

  // ── Marker builder ───────────────────────────────────────────────────────────

  const addMarkers = (mapboxgl: any) => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    entities.forEach((ent) => {
      const [lng, lat] = cellToLngLat(ent.grid_x, ent.grid_y);
      const color = ENTITY_COLORS[ent.type] ?? "#94a3b8";
      const emoji = ENTITY_EMOJIS[ent.type] ?? "📍";

      const el = document.createElement("div");
      el.style.cssText = [
        `width:34px;height:34px`,
        `background:${color}16`,
        `border:1.5px solid ${color}88`,
        `border-radius:50%`,
        `display:flex;align-items:center;justify-content:center`,
        `font-size:14px;cursor:pointer`,
        `box-shadow:0 0 10px ${color}44,inset 0 0 6px ${color}1a`,
        `transition:transform 0.15s,box-shadow 0.15s`,
        `backdrop-filter:blur(4px)`,
      ].join(";");
      el.textContent = emoji;

      const tooltipRows = [
        { label: "TYPE", value: ent.type, color },
        { label: "STATUS", value: ent.status ?? "unknown" },
        { label: "GRID", value: `(${ent.grid_x}, ${ent.grid_y})` },
        ...(ent.severity != null
          ? [{ label: "SEVERITY", value: `${ent.severity}/10`, color: ent.severity >= 7 ? "#ef4444" : "#f97316" }]
          : []),
        ...(ent.priority != null
          ? [{ label: "PRIORITY", value: `P${ent.priority}` }]
          : []),
        ...(ent.quantity != null
          ? [{ label: "QUANTITY", value: `${ent.quantity}` }]
          : []),
      ];

      el.addEventListener("mouseenter", (e) => {
        el.style.transform = "scale(1.35)";
        el.style.boxShadow = `0 0 20px ${color}88,inset 0 0 8px ${color}44`;
        setTooltipRef.current({
          x: (e as MouseEvent).clientX,
          y: (e as MouseEvent).clientY,
          title: ent.name ?? ent.type,
          rows: tooltipRows,
        });
      });
      el.addEventListener("mousemove", (e) => {
        setTooltipRef.current((prev) =>
          prev ? { ...prev, x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY } : null
        );
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)";
        el.style.boxShadow = `0 0 10px ${color}44,inset 0 0 6px ${color}1a`;
        setTooltipRef.current(null);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map);
      markersRef.current.push(marker);
    });

    drones.forEach((drone) => {
      const [lng, lat] = droneToLngLat(drone.current_x ?? 0, drone.current_y ?? 0);
      const color = DRONE_COLORS[drone.color] ?? "#3b82f6";
      const battColor =
        drone.battery > 60 ? "#22c55e" : drone.battery > 30 ? "#f59e0b" : "#ef4444";

      const el = document.createElement("div");
      el.style.cssText = [
        `width:36px;height:36px`,
        `background:${color}`,
        `border:1.5px solid rgba(255,255,255,0.35)`,
        `border-radius:9px`,
        `display:flex;align-items:center;justify-content:center`,
        `font-size:16px;cursor:pointer`,
        `box-shadow:0 2px 12px ${color}88`,
        `transition:transform 0.15s,box-shadow 0.15s`,
      ].join(";");
      el.textContent = "🚁";

      el.addEventListener("mouseenter", (e) => {
        el.style.transform = "scale(1.3)";
        el.style.boxShadow = `0 4px 22px ${color}cc`;
        setTooltipRef.current({
          x: (e as MouseEvent).clientX,
          y: (e as MouseEvent).clientY,
          title: drone.name,
          rows: [
            { label: "TYPE", value: "Drone", color },
            { label: "STATUS", value: drone.status.toUpperCase() },
            { label: "BATTERY", value: `${drone.battery}%`, color: battColor },
            { label: "POS", value: `(${Math.round(drone.current_x)}, ${Math.round(drone.current_y)})` },
          ],
        });
      });
      el.addEventListener("mousemove", (e) => {
        setTooltipRef.current((prev) =>
          prev ? { ...prev, x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY } : null
        );
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)";
        el.style.boxShadow = `0 2px 12px ${color}88`;
        setTooltipRef.current(null);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map);
      markersRef.current.push(marker);
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl">
      {/* Mapbox container */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Grid canvas overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Hover tooltip */}
      {tooltip && (
        <div
          className="fixed pointer-events-none z-50"
          style={{ left: tooltip.x + 14, top: tooltip.y - 10 }}
        >
          <div className="bg-slate-900/96 backdrop-blur-xl border border-slate-600/50 rounded-lg px-4 py-3 shadow-2xl shadow-black/60 min-w-[185px]">
            <p className="text-xs font-black text-white mb-2.5 tracking-wide">{tooltip.title}</p>
            <div className="space-y-1.5">
              {tooltip.rows.map((row, i) => (
                <div key={i} className="flex items-center justify-between gap-5">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0">
                    {row.label}
                  </span>
                  <span
                    className="text-xs font-bold font-mono"
                    style={{ color: row.color ?? "#cbd5e1" }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid info badge */}
      <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-sm border border-slate-700/60 rounded-lg px-3 py-2 z-10 shadow-lg">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">
          Grid Overlay
        </p>
        <p className="text-xs text-slate-300 font-mono">20×20 · Kota Kinabalu</p>
        <p className="text-[9px] text-slate-500 font-mono">
          ~{(GRID_SIZE_DEG * 111).toFixed(1)} km coverage
        </p>
      </div>

      {/* Split Legend at Bottom */}
      <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-4 z-10 pointer-events-none">
        {/* Left Column: Entities */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-lg p-3 pointer-events-auto shadow-xl">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-700/50 pb-1">Operational Legend</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {[
              { color: "#ef4444", emoji: "🧍", label: "Survivor" },
              { color: "#fbbf24", emoji: "⚠️", label: "Hazard" },
              { color: "#10b981", emoji: "📦", label: "Supply" },
              { color: "#60a5fa", emoji: "⚡", label: "Station" },
              { color: "#3b82f6", emoji: "🚁", label: "Drone" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="text-sm">{item.emoji}</span>
                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-tight">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Infrastructure & Sectors */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-lg p-3 pointer-events-auto shadow-xl">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2 border-b border-slate-700/50 pb-1">Grid Sectors</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {["SEC-1 SCHOOL", "SEC-2 IND.", "SEC-3 RES.", "SEC-4 COMM."].map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-sm bg-amber-400/30 border border-amber-400/50 flex-shrink-0" />
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!MAPBOX_TOKEN && (
        <div className="absolute bottom-1 right-2 z-10 text-[9px] text-slate-600 font-bold">
          OSM contributors
        </div>
      )}
    </div>
  );
}
