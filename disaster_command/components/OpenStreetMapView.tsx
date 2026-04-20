"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import maplibregl from "maplibre-gl";
import Link from "next/link";
import { cn } from "@/lib/utils";

type MapMode = "2D" | "3D";

interface DroneMarker {
  id: string;
  label: string;
  coordinates: [number, number];
  color?: string;
}

interface OpenStreetMapViewProps {
  className?: string;
  label?: string;
  topLeftSlot?: ReactNode;
  showModeToggle?: boolean;
  showResourcesLink?: boolean;
  resourcesHref?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  initialMapMode?: MapMode;
  threeDZoom?: number;
  threeDPitch?: number;
  threeDBearing?: number;
  buildingMinZoom?: number;
  enableTerrain?: boolean;
  terrainExaggeration?: number;
  droneMarkers?: DroneMarker[];
}

const DEFAULT_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
const BUILDINGS_LAYER_ID = "command-center-3d-buildings";

function getRasterDemSourceName(style: maplibregl.StyleSpecification): string | null {
  const sources = style.sources ?? {};

  for (const [sourceName, sourceDefinition] of Object.entries(sources)) {
    if (sourceDefinition.type === "raster-dem") {
      return sourceName;
    }
  }

  return null;
}

function ensureBuildingExtrusions(map: maplibregl.Map, minZoom: number) {
  if (map.getLayer(BUILDINGS_LAYER_ID)) {
    return;
  }

  const style = map.getStyle();
  const styleSources = style.sources ?? {};
  const hasOpenMapTilesSource = Object.prototype.hasOwnProperty.call(styleSources, "openmaptiles");

  if (!hasOpenMapTilesSource) {
    return;
  }

  const labelLayerId = style.layers?.find((layer) => layer.type === "symbol")?.id;

  map.addLayer(
    {
      id: BUILDINGS_LAYER_ID,
      type: "fill-extrusion",
      source: "openmaptiles",
      "source-layer": "building",
      minzoom: minZoom,
      filter: ["==", ["get", "extrude"], "true"],
      paint: {
        "fill-extrusion-color": "#aab4c2",
        "fill-extrusion-height": ["coalesce", ["get", "height"], 0],
        "fill-extrusion-base": ["coalesce", ["get", "min_height"], 0],
        "fill-extrusion-opacity": 0.86,
      },
      layout: {
        visibility: "none",
      },
    },
    labelLayerId,
  );
}

function applyMapMode(
  map: maplibregl.Map,
  mode: MapMode,
  options: {
    threeDZoom: number;
    threeDPitch: number;
    threeDBearing: number;
    buildingMinZoom: number;
    enableTerrain: boolean;
    terrainExaggeration: number;
  },
) {
  const {
    threeDZoom,
    threeDPitch,
    threeDBearing,
    buildingMinZoom,
    enableTerrain,
    terrainExaggeration,
  } = options;

  if (!map.isStyleLoaded()) {
    return;
  }

  if (mode === "2D") {
    map.easeTo({
      pitch: 0,
      bearing: 0,
      duration: 900,
      essential: true,
    });

    if (map.getLayer(BUILDINGS_LAYER_ID)) {
      map.setLayoutProperty(BUILDINGS_LAYER_ID, "visibility", "none");
    }

    if (map.getTerrain()) {
      map.setTerrain(null);
    }

    return;
  }

  ensureBuildingExtrusions(map, buildingMinZoom);

  if (map.getLayer(BUILDINGS_LAYER_ID)) {
    map.setLayoutProperty(BUILDINGS_LAYER_ID, "visibility", "visible");
  }

  if (enableTerrain) {
    const demSource = getRasterDemSourceName(map.getStyle());
    if (demSource) {
      map.setTerrain({ source: demSource, exaggeration: terrainExaggeration });
    }
  } else if (map.getTerrain()) {
    map.setTerrain(null);
  }

  map.easeTo({
    zoom: threeDZoom,
    pitch: threeDPitch,
    bearing: threeDBearing,
    duration: 1200,
    essential: true,
  });
}

export default function OpenStreetMapView({
  className,
  label,
  topLeftSlot,
  showModeToggle = true,
  showResourcesLink = false,
  resourcesHref = "/dashboard/resources",
  initialCenter = [0, 20],
  initialZoom = 1.8,
  initialMapMode = "2D",
  threeDZoom = 14,
  threeDPitch = 52,
  threeDBearing = 22,
  buildingMinZoom = 12,
  enableTerrain = false,
  terrainExaggeration = 1.05,
  droneMarkers = [],
}: OpenStreetMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRefs = useRef<maplibregl.Marker[]>([]);
  const [mapMode, setMapMode] = useState<MapMode>(initialMapMode);
  const mapModeRef = useRef<MapMode>(initialMapMode);

  const clearDroneMarkers = () => {
    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = [];
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: DEFAULT_STYLE_URL,
      center: initialCenter,
      zoom: initialZoom,
      pitch: 0,
      bearing: 0,
    });

    mapRef.current = map;

    const onLoad = () => {
      ensureBuildingExtrusions(map, buildingMinZoom);
      applyMapMode(map, mapModeRef.current, {
        threeDZoom,
        threeDPitch,
        threeDBearing,
        buildingMinZoom,
        enableTerrain,
        terrainExaggeration,
      });
    };

    map.on("load", onLoad);

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      clearDroneMarkers();
      map.off("load", onLoad);
      map.remove();
      mapRef.current = null;
    };
  }, [
    buildingMinZoom,
    enableTerrain,
    initialCenter,
    initialZoom,
    terrainExaggeration,
    threeDBearing,
    threeDPitch,
    threeDZoom,
  ]);

  useEffect(() => {
    mapModeRef.current = mapMode;

    const map = mapRef.current;
    if (!map) {
      return;
    }

    applyMapMode(map, mapMode, {
      threeDZoom,
      threeDPitch,
      threeDBearing,
      buildingMinZoom,
      enableTerrain,
      terrainExaggeration,
    });
  }, [
    mapMode,
    threeDZoom,
    threeDPitch,
    threeDBearing,
    buildingMinZoom,
    enableTerrain,
    terrainExaggeration,
  ]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const onStyleData = () => {
      ensureBuildingExtrusions(map, buildingMinZoom);
      applyMapMode(map, mapModeRef.current, {
        threeDZoom,
        threeDPitch,
        threeDBearing,
        buildingMinZoom,
        enableTerrain,
        terrainExaggeration,
      });
    };

    map.on("styledata", onStyleData);

    return () => {
      map.off("styledata", onStyleData);
    };
  }, [
    threeDZoom,
    threeDPitch,
    threeDBearing,
    buildingMinZoom,
    enableTerrain,
    terrainExaggeration,
  ]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    clearDroneMarkers();

    droneMarkers.forEach((drone) => {
      const element = document.createElement("div");
      element.style.display = "flex";
      element.style.alignItems = "center";
      element.style.gap = "6px";

      const dot = document.createElement("div");
      dot.style.width = "12px";
      dot.style.height = "12px";
      dot.style.borderRadius = "9999px";
      dot.style.border = "2px solid #ffffff";
      dot.style.backgroundColor = drone.color ?? "#2563eb";
      dot.style.boxShadow = "0 1px 3px rgba(15, 23, 42, 0.35)";

      const label = document.createElement("span");
      label.textContent = drone.label;
      label.style.fontSize = "11px";
      label.style.fontWeight = "700";
      label.style.lineHeight = "1";
      label.style.color = "#0f172a";
      label.style.backgroundColor = "rgba(255, 255, 255, 0.92)";
      label.style.border = "1px solid rgba(148, 163, 184, 0.55)";
      label.style.borderRadius = "9999px";
      label.style.padding = "2px 7px";
      label.style.backdropFilter = "blur(2px)";

      element.appendChild(dot);
      element.appendChild(label);

      const marker = new maplibregl.Marker({ element, anchor: "left" })
        .setLngLat(drone.coordinates)
        .addTo(map);

      markerRefs.current.push(marker);
    });

    return () => {
      clearDroneMarkers();
    };
  }, [droneMarkers]);

  return (
    <div className={cn("relative h-full w-full", className)}>
      {topLeftSlot ? (
        <div className="absolute left-4 top-4 z-20">{topLeftSlot}</div>
      ) : label ? (
        <div className="absolute left-4 top-16 z-20 rounded-md bg-white/85 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-sm">
          {label}
        </div>
      ) : null}

      <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
        {showModeToggle && (
          <div className="inline-flex rounded-lg border border-slate-200 bg-white/90 p-1 shadow-sm backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setMapMode("2D")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                mapMode === "2D"
                  ? "bg-blue-600 text-white"
                  : "text-slate-700 hover:bg-slate-100",
              )}
              aria-pressed={mapMode === "2D"}
            >
              2D
            </button>
            <button
              type="button"
              onClick={() => setMapMode("3D")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                mapMode === "3D"
                  ? "bg-blue-600 text-white"
                  : "text-slate-700 hover:bg-slate-100",
              )}
              aria-pressed={mapMode === "3D"}
            >
              3D
            </button>
          </div>
        )}

        {showResourcesLink && (
          <Link
            href={resourcesHref}
            className="rounded-lg border border-blue-200 bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            Resources
          </Link>
        )}
      </div>

      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  );
}
