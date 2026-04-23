"use client";

import React, { useEffect, useRef } from "react";
import type { GridDrone, GridEntity } from "./ThreeJSGrid";

interface MapLibreMapProps {
  drones: GridDrone[];
  entities: GridEntity[];
}

// Ranau, Sabah (epicentre of 2015 earthquake — contextually appropriate)
const MAP_CENTER: [number, number] = [116.7, 5.96];
const MAP_ZOOM = 13;

// Grid spans roughly 2km × 2km around the centre
const GRID_SIZE_DEG = 0.018; // ~2 km in degrees at this latitude
const GRID = 20;

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

export function MapLibreMap({ drones, entities }: MapLibreMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const canvasOverlayRef = useRef<HTMLCanvasElement>(null);

  // Draw the grid overlay onto a fixed canvas element positioned over the map
  const drawGridOverlay = () => {
    const canvas = canvasOverlayRef.current;
    const map = mapRef.current;
    if (!canvas || !map) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Convert grid corners to pixel coords
    const topLeft = map.project(cellToLngLat(0, 0));
    const bottomRight = map.project(cellToLngLat(GRID, GRID));

    const pxX0 = topLeft.x;
    const pxY0 = topLeft.y;
    const pxW = bottomRight.x - topLeft.x;
    const pxH = bottomRight.y - topLeft.y;

    const cellW = pxW / GRID;
    const cellH = pxH / GRID;

    // Checkerboard tiling
    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        const even = (r + c) % 2 === 0;
        ctx.fillStyle = even ? "rgba(30,41,59,0.25)" : "rgba(15,23,42,0.15)";
        ctx.fillRect(pxX0 + c * cellW, pxY0 + r * cellH, cellW, cellH);
      }
    }

    // Grid lines
    ctx.strokeStyle = "rgba(99,102,241,0.5)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID; i++) {
      // vertical
      ctx.beginPath();
      ctx.moveTo(pxX0 + i * cellW, pxY0);
      ctx.lineTo(pxX0 + i * cellW, pxY0 + pxH);
      ctx.stroke();
      // horizontal
      ctx.beginPath();
      ctx.moveTo(pxX0, pxY0 + i * cellH);
      ctx.lineTo(pxX0 + pxW, pxY0 + i * cellH);
      ctx.stroke();
    }

    // Thicker boundary
    ctx.strokeStyle = "rgba(99,102,241,0.85)";
    ctx.lineWidth = 2;
    ctx.strokeRect(pxX0, pxY0, pxW, pxH);

    // Grid coord labels every 5 cells
    ctx.fillStyle = "rgba(148,163,184,0.9)";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    for (let i = 0; i <= GRID; i += 5) {
      ctx.fillText(`${i}`, pxX0 + i * cellW, pxY0 - 4);
      ctx.textAlign = "right";
      ctx.fillText(`${i}`, pxX0 - 4, pxY0 + i * cellH + 4);
      ctx.textAlign = "center";
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    let map: any;

    (async () => {
      const maplibre = await import("maplibre-gl");
      await import("maplibre-gl/dist/maplibre-gl.css");

      map = new maplibre.Map({
        container: containerRef.current!,
        style: {
          version: 8,
          sources: {
            "osm-tiles": {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "© OpenStreetMap contributors",
            },
          },
          layers: [
            {
              id: "osm-layer",
              type: "raster",
              source: "osm-tiles",
              paint: { "raster-opacity": 0.75 },
            },
          ],
        },
        center: MAP_CENTER,
        zoom: MAP_ZOOM,
      });

      mapRef.current = map;

      map.on("load", () => {
        drawGridOverlay();
        addMarkers(maplibre);
      });

      map.on("move", () => drawGridOverlay());
      map.on("zoom", () => drawGridOverlay());
      map.on("resize", () => {
        if (canvasOverlayRef.current) {
          canvasOverlayRef.current.width = containerRef.current!.offsetWidth;
          canvasOverlayRef.current.height = containerRef.current!.offsetHeight;
        }
        drawGridOverlay();
      });
    })();

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-add markers when data changes
  useEffect(() => {
    if (!mapRef.current) return;
    (async () => {
      const maplibre = await import("maplibre-gl");
      addMarkers(maplibre);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drones, entities]);

  const addMarkers = (maplibre: any) => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Entity markers
    entities.forEach((ent) => {
      const [lng, lat] = cellToLngLat(ent.grid_x, ent.grid_y);
      const color = ENTITY_COLORS[ent.type] ?? "#94a3b8";
      const emoji = ENTITY_EMOJIS[ent.type] ?? "📍";

      const el = document.createElement("div");
      el.style.cssText = `
        width: 32px; height: 32px;
        background: ${color}22;
        border: 2px solid ${color};
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 14px; cursor: pointer;
        box-shadow: 0 0 8px ${color}66;
        transition: transform 0.15s;
      `;
      el.textContent = emoji;
      el.title = ent.name ?? ent.type;
      el.addEventListener("mouseenter", () => { el.style.transform = "scale(1.25)"; });
      el.addEventListener("mouseleave", () => { el.style.transform = "scale(1)"; });

      const marker = new maplibre.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(
          new maplibre.Popup({ offset: 20, className: "grid-popup" }).setHTML(`
            <div style="font-family:monospace;font-size:11px;padding:4px 6px">
              <b style="color:${color}">${ent.name ?? ent.type}</b><br/>
              Type: ${ent.type}<br/>
              Status: ${ent.status ?? "unknown"}<br/>
              Grid: (${ent.grid_x}, ${ent.grid_y})
            </div>
          `)
        )
        .addTo(map);

      markersRef.current.push(marker);
    });

    // Drone markers
    drones.forEach((drone) => {
      const [lng, lat] = droneToLngLat(drone.current_x ?? 0, drone.current_y ?? 0);
      const color = DRONE_COLORS[drone.color] ?? "#3b82f6";

      const el = document.createElement("div");
      el.style.cssText = `
        width: 36px; height: 36px;
        background: ${color};
        border: 2px solid white;
        border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        font-size: 16px; cursor: pointer;
        box-shadow: 0 2px 8px ${color}88;
        transition: transform 0.15s;
      `;
      el.textContent = "🚁";
      el.title = drone.name;
      el.addEventListener("mouseenter", () => { el.style.transform = "scale(1.25)"; });
      el.addEventListener("mouseleave", () => { el.style.transform = "scale(1)"; });

      const battColor = drone.battery > 60 ? "#22c55e" : drone.battery > 30 ? "#f59e0b" : "#ef4444";
      const marker = new maplibre.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(
          new maplibre.Popup({ offset: 22, className: "grid-popup" }).setHTML(`
            <div style="font-family:monospace;font-size:11px;padding:4px 6px">
              <b style="color:${color}">${drone.name}</b><br/>
              Status: ${drone.status}<br/>
              Battery: <span style="color:${battColor}">${drone.battery}%</span><br/>
              Pos: (${Math.round(drone.current_x)}, ${Math.round(drone.current_y)})
            </div>
          `)
        )
        .addTo(map);

      markersRef.current.push(marker);
    });
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      {/* Map container */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Grid canvas overlay */}
      <canvas
        ref={canvasOverlayRef}
        className="absolute inset-0 pointer-events-none"
        width={800}
        height={600}
        style={{ width: "100%", height: "100%" }}
      />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-xl p-3 z-10">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Legend</p>
        {[
          { color: "#ef4444", emoji: "🧍", label: "Survivor" },
          { color: "#fbbf24", emoji: "⚠️", label: "Hazard" },
          { color: "#10b981", emoji: "📦", label: "Supply" },
          { color: "#60a5fa", emoji: "⚡", label: "Recharge" },
          { color: "#3b82f6", emoji: "🚁", label: "Drone" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 mt-1">
            <span className="text-xs">{item.emoji}</span>
            <span className="text-[10px] text-slate-300 font-medium">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Attribution */}
      <div className="absolute bottom-2 right-2 z-10 text-[9px] text-slate-500">
        © OpenStreetMap contributors
      </div>
    </div>
  );
}
