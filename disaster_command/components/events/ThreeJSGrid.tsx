"use client";

import React, { useRef, useMemo, Suspense, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GridDrone {
  id: string;
  name: string;
  status: string;
  battery: number;
  color: string;
  current_x: number;
  current_y: number;
}

export interface GridEntity {
  id: string;
  type: "survivor" | "hazard" | "supply" | "recharge_station" | "water" | "supply_request";
  name: string | null;
  status: string | null;
  grid_x: number;
  grid_y: number;
  severity?: number | null;
  priority?: number | null;
  quantity?: number | null;
  capacity?: number | null;
  battery_level?: number | null;
  metadata?: unknown;
}

interface HoverData {
  title: string;
  rows: { label: string; value: string; color?: string }[];
}

export interface VisitedCell {
  x: number;
  y: number;
  scanned_by: string;
  drone_color: string;
}

interface ThreeJSGridProps {
  drones: GridDrone[];
  entities: GridEntity[];
  visitedCells?: VisitedCell[];
  rotationState?: {
    isRotating: boolean;
    direction: 1 | -1;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GRID = 20;
const CELL = 1;
const HALF = (GRID * CELL) / 2;

function gridToWorld(gx: number, gy: number): [number, number] {
  return [gx * CELL - HALF + CELL / 2, gy * CELL - HALF + CELL / 2];
}

function droneToWorld(cx: number, cy: number): [number, number] {
  // current_x / current_y are stored as 0-19 grid coordinates
  const gx = Math.min(19, Math.max(0, Math.round(cx)));
  const gy = Math.min(19, Math.max(0, Math.round(cy)));
  return gridToWorld(gx, gy);
}

const DRONE_HEX: Record<string, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#eab308",
  purple: "#a855f7",
};

// ─── Grid Floor ───────────────────────────────────────────────────────────────

const VISITED_COLORS: Record<string, string> = {
  red: "#7f1d1d",
  blue: "#1e3a8a",
  green: "#14532d",
  yellow: "#713f12",
  purple: "#3b0764",
};

function GridFloor({ visitedCells = [] }: { visitedCells?: VisitedCell[] }) {
  const visitedMap = useMemo(() => {
    const m: Record<string, string> = {};
    visitedCells.forEach((c) => { m[`${c.x}-${c.y}`] = c.drone_color || "blue"; });
    return m;
  }, [visitedCells]);

  const tiles = useMemo(() => {
    const arr: { key: string; x: number; z: number; even: boolean; gx: number; gy: number }[] = [];
    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        const [wx, wz] = gridToWorld(c, r);
        arr.push({ key: `${r}-${c}`, x: wx, z: wz, even: (r + c) % 2 === 0, gx: c, gy: r });
      }
    }
    return arr;
  }, []);

  return (
    <group>
      {tiles.map(({ key, x, z, even, gx, gy }) => {
        const visitColor = visitedMap[`${gx}-${gy}`];
        const baseColor = visitColor
          ? (VISITED_COLORS[visitColor] ?? "#1e3a8a")
          : (even ? "#1e293b" : "#0f172a");
        const emissive = visitColor
          ? (VISITED_COLORS[visitColor] ?? "#1e3a8a")
          : (even ? "#1e3a5f" : "#0a1628");
        const emissiveIntensity = visitColor ? 0.45 : 0.08;

        return (
          <mesh key={key} position={[x, 0, z]} receiveShadow>
            <boxGeometry args={[CELL, 0.04, CELL]} />
            <meshStandardMaterial
              color={baseColor}
              roughness={0.85}
              metalness={0.15}
              emissive={emissive}
              emissiveIntensity={emissiveIntensity}
            />
          </mesh>
        );
      })}
      {/* Grid lines */}
      <gridHelper args={[GRID * CELL, GRID, "#ffffff", "#8899cc"]} position={[0, 0.03, 0]} />
      {/* White boundary frame */}
      {([-HALF, HALF] as number[]).map((z) => (
        <mesh key={`hedge-${z}`} position={[0, 0.04, z]}>
          <boxGeometry args={[GRID * CELL + 0.1, 0.02, 0.07]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2.5} />
        </mesh>
      ))}
      {([-HALF, HALF] as number[]).map((xv) => (
        <mesh key={`vedge-${xv}`} position={[xv, 0.04, 0]}>
          <boxGeometry args={[0.07, 0.02, GRID * CELL + 0.1]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2.5} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Axis Labels ──────────────────────────────────────────────────────────────

function AxisLabels() {
  const labels = useMemo(() => {
    const out: { key: string; text: string; x: number; z: number }[] = [];
    for (let i = 0; i < GRID; i += 5) {
      const [wx] = gridToWorld(i, 0);
      const [, wz] = gridToWorld(0, i);
      out.push({ key: `col-${i}`, text: `${i}`, x: wx, z: HALF + 0.9 });
      out.push({ key: `row-${i}`, text: `${i}`, x: -(HALF + 0.9), z: wz });
    }
    return out;
  }, []);

  return (
    <>
      {labels.map(({ key, text, x, z }) => (
        <Billboard key={key} position={[x, 0.2, z]}>
          <Text fontSize={0.32} color="#334155" anchorX="center" anchorY="middle">
            {text}
          </Text>
        </Billboard>
      ))}
    </>
  );
}

// ─── Drone ────────────────────────────────────────────────────────────────────

function DroneModel({
  x, z, color, label, battery, status, onHover,
}: {
  x: number; z: number; color: string; label: string;
  battery: number; status: string;
  onHover: (data: HoverData | null) => void;
}) {
  const r1 = useRef<THREE.Mesh>(null!);
  const r2 = useRef<THREE.Mesh>(null!);
  const r3 = useRef<THREE.Mesh>(null!);
  const r4 = useRef<THREE.Mesh>(null!);
  const bodyGroup = useRef<THREE.Group>(null!);
  const shadowMesh = useRef<THREE.Mesh>(null!);

  const isFlying = !["idle", "returning"].includes(status.toLowerCase());
  const altitude = isFlying ? 0.6 : 0.28;
  const hexColor = DRONE_HEX[color] ?? "#3b82f6";
  const battColor = battery > 60 ? "#22c55e" : battery > 30 ? "#f59e0b" : "#ef4444";

  useFrame((state, delta) => {
    const speed = isFlying ? 9 : 2;
    [r1, r2, r3, r4].forEach((r) => {
      if (r.current) r.current.rotation.y += delta * speed;
    });
    if (bodyGroup.current) {
      bodyGroup.current.position.y = Math.sin(state.clock.elapsedTime * 1.8) * 0.045;
    }
    if (shadowMesh.current) {
      const mat = shadowMesh.current.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.18 + Math.sin(state.clock.elapsedTime * 1.8) * 0.06;
    }
  });

  const armLen = 0.28;
  const arms: [number, number, number][] = [
    [armLen, 0, armLen], [-armLen, 0, armLen],
    [armLen, 0, -armLen], [-armLen, 0, -armLen],
  ];
  const rotorRefs = [r1, r2, r3, r4];

  return (
    <group
      position={[x, altitude, z]}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover({
          title: label,
          rows: [
            { label: "TYPE", value: "Drone" },
            { label: "STATUS", value: status.toUpperCase(), color: isFlying ? "#22c55e" : "#94a3b8" },
            { label: "BATTERY", value: `${battery}%`, color: battColor },
            { label: "COLOR", value: color.toUpperCase() },
          ],
        });
      }}
      onPointerOut={(e) => { e.stopPropagation(); onHover(null); }}
    >
      {/* Ground shadow projection */}
      <mesh ref={shadowMesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -altitude + 0.05, 0]}>
        <circleGeometry args={[0.38, 16]} />
        <meshStandardMaterial
          color={hexColor} emissive={hexColor} emissiveIntensity={0.6}
          transparent opacity={0.18}
        />
      </mesh>

      <group ref={bodyGroup}>
        {/* Main body */}
        <mesh castShadow>
          <boxGeometry args={[0.24, 0.09, 0.24]} />
          <meshStandardMaterial color={hexColor} roughness={0.25} metalness={0.75}
            emissive={hexColor} emissiveIntensity={0.12} />
        </mesh>
        {/* Camera dome */}
        <mesh position={[0, -0.07, 0]}>
          <sphereGeometry args={[0.065, 10, 10]} />
          <meshStandardMaterial color="#0f172a" roughness={0.05} metalness={0.95} />
        </mesh>
        {/* Arms + rotors */}
        {arms.map(([ax, ay, az], i) => (
          <group key={i} position={[ax, ay, az]}>
            <mesh>
              <boxGeometry args={[
                Math.abs(ax) > 0 ? 0.3 : 0.04,
                0.03,
                Math.abs(az) > 0 ? 0.3 : 0.04,
              ]} />
              <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.3} />
            </mesh>
            <mesh ref={rotorRefs[i]} position={[0, 0.025, 0]}>
              <cylinderGeometry args={[0.155, 0.155, 0.01, 12]} />
              <meshStandardMaterial color={hexColor} transparent
                opacity={isFlying ? 0.3 : 0.65} roughness={0.05} />
            </mesh>
          </group>
        ))}
        {/* Battery bar */}
        <mesh position={[0, 0.065, 0]}>
          <boxGeometry args={[0.2 * (battery / 100), 0.016, 0.045]} />
          <meshStandardMaterial color={battColor} emissive={battColor} emissiveIntensity={0.6} />
        </mesh>
      </group>

      <Billboard position={[0, 0.7, 0]}>
        <Text fontSize={0.17} color="#f1f5f9" anchorX="center" anchorY="middle"
          outlineWidth={0.025} outlineColor="#020617">
          {label}
        </Text>
        <Text fontSize={0.13} color={battColor} anchorX="center" anchorY="middle"
          position={[0, -0.23, 0]}>
          ⚡ {battery}%
        </Text>
      </Billboard>
    </group>
  );
}

// ─── Survivor ─────────────────────────────────────────────────────────────────

function SurvivorMarker({
  x, z, status, name, priority, severity, onHover,
}: {
  x: number; z: number; status: string | null; name: string | null;
  priority?: number | null; severity?: number | null;
  onHover: (data: HoverData | null) => void;
}) {
  const bodyRef = useRef<THREE.Mesh>(null!);
  const outerRing = useRef<THREE.Mesh>(null!);
  const innerRing = useRef<THREE.Mesh>(null!);

  const isCritical = status === "critical";
  const isInjured = status === "injured";
  const color = isCritical ? "#ef4444" : isInjured ? "#f97316" : "#22c55e";
  const statusLabel = isCritical ? "CRITICAL" : isInjured ? "INJURED" : "STABLE";

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (bodyRef.current) {
      bodyRef.current.position.y = 0.38 + Math.sin(t * (isCritical ? 3 : 2)) * 0.07;
    }
    if (outerRing.current) {
      const s = 1 + Math.sin(t * (isCritical ? 4 : 2.5)) * 0.35;
      outerRing.current.scale.set(s, 1, s);
      (outerRing.current.material as THREE.MeshStandardMaterial).opacity =
        0.55 - Math.sin(t * (isCritical ? 4 : 2.5)) * 0.35;
    }
    if (innerRing.current) {
      const s = 1 + Math.sin(t * 2 + 1) * 0.2;
      innerRing.current.scale.set(s, 1, s);
    }
  });

  return (
    <group
      position={[x, 0, z]}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover({
          title: name ?? "Survivor",
          rows: [
            { label: "TYPE", value: "Survivor" },
            { label: "STATUS", value: statusLabel, color },
            ...(priority != null ? [{ label: "PRIORITY", value: `P${priority}` }] : []),
            ...(severity != null ? [{ label: "SEVERITY", value: `${severity}/10`, color: severity >= 7 ? "#ef4444" : "#f97316" }] : []),
          ],
        });
      }}
      onPointerOut={(e) => { e.stopPropagation(); onHover(null); }}
    >
      {/* Ground glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.38, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4}
          transparent opacity={0.18} />
      </mesh>
      {/* Pulse rings */}
      <mesh ref={outerRing} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[0.3, 0.46, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5}
          transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={innerRing} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[0.14, 0.24, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3}
          transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Pin pole */}
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.34, 6]} />
        <meshStandardMaterial color="#64748b" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Body */}
      <mesh ref={bodyRef} castShadow position={[0, 0.38, 0]}>
        <capsuleGeometry args={[0.13, 0.3, 6, 12]} />
        <meshStandardMaterial color={color} roughness={0.3} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      <Billboard position={[0, 0.95, 0]}>
        <Text fontSize={0.15} color="#f1f5f9" anchorX="center" anchorY="middle"
          outlineWidth={0.025} outlineColor="#020617">
          {name ?? "Survivor"}
        </Text>
        <Text fontSize={0.12} color={color} anchorX="center" anchorY="middle"
          position={[0, -0.2, 0]}>
          {statusLabel}
        </Text>
      </Billboard>
    </group>
  );
}

// ─── Hazard ───────────────────────────────────────────────────────────────────

function HazardMarker({
  x, z, name, severity, status, onHover,
}: {
  x: number; z: number; name: string | null;
  severity?: number | null; status?: string | null;
  onHover: (data: HoverData | null) => void;
}) {
  const spinRef = useRef<THREE.Mesh>(null!);
  const glowBase = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (spinRef.current) spinRef.current.rotation.y = state.clock.elapsedTime * 0.9;
    if (glowBase.current) {
      (glowBase.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.5 + Math.sin(state.clock.elapsedTime * 2.5) * 0.35;
    }
  });

  return (
    <group
      position={[x, 0, z]}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover({
          title: `⚠ ${name ?? "Hazard"}`,
          rows: [
            { label: "TYPE", value: "Hazard", color: "#fbbf24" },
            { label: "STATUS", value: (status ?? "active").toUpperCase(), color: "#ef4444" },
            ...(severity != null ? [{
              label: "SEVERITY",
              value: `${severity}/10`,
              color: severity >= 7 ? "#ef4444" : severity >= 4 ? "#f97316" : "#fbbf24",
            }] : []),
          ],
        });
      }}
      onPointerOut={(e) => { e.stopPropagation(); onHover(null); }}
    >
      {/* Danger zone glow */}
      <mesh ref={glowBase} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.55, 6]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444"
          emissiveIntensity={0.5} transparent opacity={0.22} />
      </mesh>
      {/* Warning platform */}
      <mesh position={[0, 0.055, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.09, 6]} />
        <meshStandardMaterial color="#ca8a04" roughness={0.75}
          emissive="#ca8a04" emissiveIntensity={0.15} />
      </mesh>
      {/* Rotating octahedron */}
      <mesh ref={spinRef} position={[0, 0.34, 0]} castShadow>
        <octahedronGeometry args={[0.27, 0]} />
        <meshStandardMaterial color="#ef4444" emissive="#dc2626"
          emissiveIntensity={0.8} roughness={0.1} metalness={0.45} />
      </mesh>
      <Billboard position={[0, 0.85, 0]}>
        <Text fontSize={0.15} color="#fbbf24" anchorX="center" anchorY="middle"
          outlineWidth={0.025} outlineColor="#020617">
          ⚠ {name ?? "Hazard"}
        </Text>
      </Billboard>
    </group>
  );
}

// ─── Supply ───────────────────────────────────────────────────────────────────

function SupplyMarker({
  x, z, name, quantity, capacity, onHover,
}: {
  x: number; z: number; name: string | null;
  quantity?: number | null; capacity?: number | null;
  onHover: (data: HoverData | null) => void;
}) {
  const crateRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (crateRef.current) {
      crateRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.1) * 0.035;
    }
  });

  return (
    <group
      position={[x, 0, z]}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover({
          title: name ?? "Supply",
          rows: [
            { label: "TYPE", value: "Supply Depot", color: "#10b981" },
            ...(quantity != null ? [{ label: "QUANTITY", value: `${quantity}` }] : []),
            ...(capacity != null ? [{ label: "CAPACITY", value: `${capacity}` }] : []),
          ],
        });
      }}
      onPointerOut={(e) => { e.stopPropagation(); onHover(null); }}
    >
      {/* Pad */}
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[0.65, 0.06, 0.65]} />
        <meshStandardMaterial color="#065f46" roughness={0.55}
          emissive="#065f46" emissiveIntensity={0.2} />
      </mesh>
      {/* Crate group */}
      <group ref={crateRef} position={[0, 0.29, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.42, 0.42, 0.42]} />
          <meshStandardMaterial color="#10b981" roughness={0.35} metalness={0.2}
            emissive="#064e3b" emissiveIntensity={0.35} />
        </mesh>
        {/* Cross lid */}
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[0.4, 0.045, 0.12]} />
          <meshStandardMaterial color="#ecfdf5" />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[0.12, 0.045, 0.4]} />
          <meshStandardMaterial color="#ecfdf5" />
        </mesh>
      </group>
      <Billboard position={[0, 0.88, 0]}>
        <Text fontSize={0.14} color="#34d399" anchorX="center" anchorY="middle"
          outlineWidth={0.025} outlineColor="#020617">
          {name ?? "Supply"}
        </Text>
      </Billboard>
    </group>
  );
}

// ─── Recharge ─────────────────────────────────────────────────────────────────

function RechargeMarker({
  x, z, name, onHover,
}: {
  x: number; z: number; name: string | null;
  onHover: (data: HoverData | null) => void;
}) {
  const coreRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const tipRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (coreRef.current) {
      (coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.65 + Math.sin(t * 4) * 0.4;
    }
    if (ringRef.current) ringRef.current.rotation.y = t * 0.6;
    if (tipRef.current) {
      (tipRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.8 + Math.sin(t * 5) * 0.5;
    }
  });

  return (
    <group
      position={[x, 0, z]}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover({
          title: `⚡ ${name ?? "Recharge"}`,
          rows: [
            { label: "TYPE", value: "Recharge Station", color: "#60a5fa" },
            { label: "STATUS", value: "ACTIVE", color: "#22c55e" },
          ],
        });
      }}
      onPointerOut={(e) => { e.stopPropagation(); onHover(null); }}
    >
      {/* Platform */}
      <mesh position={[0, 0.055, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.11, 12]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.4} metalness={0.55}
          emissive="#1e3a8a" emissiveIntensity={0.25} />
      </mesh>
      {/* Rotating torus */}
      <mesh ref={ringRef} position={[0, 0.13, 0]}>
        <torusGeometry args={[0.42, 0.045, 8, 28]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.6} />
      </mesh>
      {/* Energy core */}
      <mesh ref={coreRef} position={[0, 0.37, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.2, 0.5, 6]} />
        <meshStandardMaterial color="#60a5fa" emissive="#3b82f6"
          emissiveIntensity={0.65} roughness={0.08} metalness={0.85} />
      </mesh>
      {/* Antenna */}
      <mesh position={[0, 0.68, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.28, 6]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh ref={tipRef} position={[0, 0.83, 0]}>
        <sphereGeometry args={[0.065, 10, 10]} />
        <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.8} />
      </mesh>
      <Billboard position={[0, 1.05, 0]}>
        <Text fontSize={0.16} color="#93c5fd" anchorX="center" anchorY="middle"
          outlineWidth={0.025} outlineColor="#020617">
          ⚡ {name ?? "RECHARGE"}
        </Text>
      </Billboard>
    </group>
  );
}

// ─── Water Request ────────────────────────────────────────────────────────────

function WaterMarker({
  x, z, name, onHover,
}: {
  x: number; z: number; name: string | null;
  onHover: (data: HoverData | null) => void;
}) {
  const floatRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (floatRef.current) {
      floatRef.current.position.y = 0.3 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
      floatRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group
      position={[x, 0, z]}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover({
          title: `💧 ${name ?? "Water Request"}`,
          rows: [
            { label: "TYPE", value: "Water Request", color: "#06b6d4" },
            { label: "STATUS", value: "PENDING", color: "#f59e0b" },
          ],
        });
      }}
      onPointerOut={(e) => { e.stopPropagation(); onHover(null); }}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.35, 16]} />
        <meshStandardMaterial color="#0891b2" emissive="#0891b2"
          emissiveIntensity={0.4} transparent opacity={0.15} />
      </mesh>
      
      <group ref={floatRef}>
        <mesh castShadow>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#06b6d4" emissive="#0891b2"
            emissiveIntensity={0.6} roughness={0.1} metalness={0.8} transparent opacity={0.9} />
        </mesh>
        <Billboard position={[0, 0.4, 0]}>
           <Text fontSize={0.15} color="#22d3ee" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#083344">
             💧
           </Text>
        </Billboard>
      </group>

      <Billboard position={[0, 0.85, 0]}>
        <Text fontSize={0.14} color="#06b6d4" anchorX="center" anchorY="middle"
          outlineWidth={0.02} outlineColor="#020617">
          {name ?? "WATER"}
        </Text>
      </Billboard>
    </group>
  );
}

// ─── Supply Request ───────────────────────────────────────────────────────────

function SupplyRequestMarker({
  x, z, name, metadata, onHover,
}: {
  x: number; z: number; name: string | null;
  metadata?: any;
  onHover: (data: HoverData | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = 0.25 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      groupRef.current.rotation.y += 0.02;
    }
  });

  const requestedItem = metadata?.requested_item || "Supplies";
  const urgency = metadata?.urgency || "Normal";

  return (
    <group
      position={[x, 0, z]}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover({
          title: name ?? "Supply Request",
          rows: [
            { label: "TYPE", value: "Supply Request", color: "#f97316" },
            { label: "ITEM", value: requestedItem.replace("_", " ").toUpperCase() },
            { label: "URGENCY", value: urgency.toUpperCase(), color: urgency === "high" || urgency === "critical" ? "#ef4444" : "#f97316" },
          ],
        });
      }}
      onPointerOut={(e) => { e.stopPropagation(); onHover(null); }}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.4, 16]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316"
          emissiveIntensity={0.4} transparent opacity={0.15} />
      </mesh>
      
      <group ref={groupRef}>
        {/* Floating Diamond for Supply Request */}
        <mesh castShadow>
          <octahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial color="#f97316" emissive="#f97316"
            emissiveIntensity={0.6} roughness={0.2} metalness={0.8} />
        </mesh>
        <Billboard position={[0, 0.35, 0]}>
           <Text fontSize={0.15} color="#fb923c" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#431407">
             📦
           </Text>
        </Billboard>
      </group>

      <Billboard position={[0, 0.8, 0]}>
        <Text fontSize={0.13} color="#f97316" anchorX="center" anchorY="middle"
          outlineWidth={0.02} outlineColor="#020617">
          {name ?? "REQUEST"}
        </Text>
      </Billboard>
    </group>
  );
}

// ─── Scene ────────────────────────────────────────────────────────────────────

function Scene({
  drones, entities, visitedCells, onHover, rotationState, onRotationEnd,
}: {
  drones: GridDrone[];
  entities: GridEntity[];
  visitedCells?: VisitedCell[];
  onHover: (data: HoverData | null) => void;
  rotationState?: { isRotating: boolean; direction: 1 | -1 };
  onRotationEnd?: () => void;
}) {
  const controlsRef = useRef<any>(null);
  const targetRotation = useRef<number | null>(null);

  useFrame((state, delta) => {
    if (!controlsRef.current) return;

    if (rotationState?.isRotating) {
      // Rotate once logic: 90 degrees (PI/2) increment
      if (targetRotation.current === null) {
        targetRotation.current = controlsRef.current.getAzimuthalAngle() + (Math.PI / 2) * rotationState.direction;
      }

      const current = controlsRef.current.getAzimuthalAngle();
      const diff = (targetRotation.current ?? current) - current;

      if (Math.abs(diff) > 0.01) {
        // Smoothly interpolate to target
        controlsRef.current.setAzimuthalAngle(current + diff * 0.1);
        controlsRef.current.update();
      } else {
        targetRotation.current = null;
        if (onRotationEnd) onRotationEnd();
      }
    } else {
      targetRotation.current = null;
    }
  });

  return (
    <>
      {/* Atmospheric depth fog */}
      <fog attach="fog" args={["#060c1a", 20, 42]} />

      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 22, 10]}
        intensity={0.9}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <pointLight position={[0, 9, 0]} intensity={1.0} color="#1e40af" />
      <pointLight position={[-9, 4, -9]} intensity={0.5} color="#0c2d6e" />
      <pointLight position={[9, 4, 9]} intensity={0.5} color="#0c2d6e" />
      <pointLight position={[0, 3, 0]} intensity={0.25} color="#60a5fa" />

      <GridFloor visitedCells={visitedCells} />
      <AxisLabels />

      {entities.map((ent) => {
        const [wx, wz] = gridToWorld(ent.grid_x, ent.grid_y);
        switch (ent.type) {
          case "survivor":
            return (
              <SurvivorMarker
                key={ent.id} x={wx} z={wz}
                status={ent.status} name={ent.name}
                priority={ent.priority} severity={ent.severity}
                onHover={onHover}
              />
            );
          case "hazard":
            return (
              <HazardMarker
                key={ent.id} x={wx} z={wz}
                name={ent.name} severity={ent.severity}
                status={ent.status} onHover={onHover}
              />
            );
          case "supply":
            return (
              <SupplyMarker
                key={ent.id} x={wx} z={wz}
                name={ent.name} quantity={ent.quantity}
                capacity={ent.capacity} onHover={onHover}
              />
            );
          case "recharge_station":
            return (
              <RechargeMarker
                key={ent.id} x={wx} z={wz}
                name={ent.name} onHover={onHover}
              />
            );
          case "water":
            return (
              <WaterMarker
                key={ent.id} x={wx} z={wz}
                name={ent.name} onHover={onHover}
              />
            );
          case "supply_request":
            return (
              <SupplyRequestMarker
                key={ent.id} x={wx} z={wz}
                name={ent.name} metadata={ent.metadata}
                onHover={onHover}
              />
            );
          default:
            return null;
        }
      })}

      {drones.map((d) => {
        const [wx, wz] = droneToWorld(d.current_x ?? 0, d.current_y ?? 0);
        return (
          <DroneModel
            key={d.id} x={wx} z={wz}
            color={d.color} label={d.name}
            battery={d.battery} status={d.status}
            onHover={onHover}
          />
        );
      })}

      <OrbitControls
        ref={controlsRef}
        enablePan enableZoom enableRotate
        minDistance={6} maxDistance={38}
        maxPolarAngle={Math.PI / 2.08}
      />
    </>
  );
}

// ─── Hover Tooltip ────────────────────────────────────────────────────────────

function HoverTooltip({ data, x, y }: { data: HoverData; x: number; y: number }) {
  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{ left: x + 16, top: y - 8 }}
    >
      <div className="bg-slate-900/96 backdrop-blur-xl border border-slate-600/50 rounded-xl px-4 py-3 shadow-2xl shadow-black/60 min-w-[180px]">
        <p className="text-[11px] font-black text-white mb-2.5 tracking-wide">{data.title}</p>
        <div className="space-y-1.5">
          {data.rows.map((row, i) => (
            <div key={i} className="flex items-center justify-between gap-5">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest shrink-0">
                {row.label}
              </span>
              <span className="text-[10px] font-bold font-mono" style={{ color: row.color ?? "#cbd5e1" }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

export function GridLegend() {
  const [isOpen, setIsOpen] = useState(false);

  const items = [
    { icon: "🧍", color: "#ef4444", label: "Survivor" },
    { icon: "⚠️", color: "#fbbf24", label: "Hazard" },
    { icon: "📦", color: "#10b981", label: "Supply Depot" },
    { icon: "🎁", color: "#f97316", label: "Supply Request" },
    { icon: "💧", color: "#06b6d4", label: "Water Request" },
    { icon: "⚡", color: "#60a5fa", label: "Recharge Station" },
    { icon: "🚁", color: "#3b82f6", label: "Active Drone" },
  ];

  return (
    <div 
      className={cn(
        "bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl transition-all duration-300 overflow-hidden",
        isOpen ? "p-4 w-56" : "p-2 w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-white"
      )}
      onClick={() => !isOpen && setIsOpen(true)}
    >
      {!isOpen ? (
        <Info className="w-5 h-5 text-slate-500" />
      ) : (
        <>
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">3D Legend</p>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-y-2.5">
            {items.map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 group">
                <div 
                  className="w-6 h-6 rounded flex items-center justify-center shrink-0 shadow-sm border border-white/50 text-sm" 
                  style={{ backgroundColor: item.color }} 
                >
                  {item.icon}
                </div>
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tight group-hover:text-slate-900 transition-colors">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Public Component ─────────────────────────────────────────────────────────

export function ThreeJSGrid({ drones, entities, visitedCells, rotationState, onRotationEnd }: ThreeJSGridProps & { onRotationEnd?: () => void }) {
  const [hovered, setHovered] = useState<HoverData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleHover = useCallback((data: HoverData | null) => setHovered(data), []);

  return (
    <div
      className="relative w-full h-full bg-[#060c1a] rounded-xl overflow-hidden"
      onPointerMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
    >
      <Canvas
        camera={{ position: [13, 15, 13], fov: 44 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          <Scene
            drones={drones}
            entities={entities}
            visitedCells={visitedCells}
            onHover={handleHover}
            rotationState={rotationState}
            onRotationEnd={onRotationEnd}
          />
        </Suspense>
      </Canvas>

      {hovered && <HoverTooltip data={hovered} x={mousePos.x} y={mousePos.y} />}

      <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-lg px-3 py-1.5 z-10 shadow-sm">
        <p className="text-[9px] text-slate-400 font-medium tracking-tighter">
          Drag to rotate · Scroll to zoom · Right-drag to pan
        </p>
      </div>

      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-lg px-3 py-1.5 z-10 shadow-sm">
        <p className="text-[9px] text-slate-400 font-medium tracking-tighter">
          20 × 20 Tactical Grid &nbsp;·&nbsp; {drones.length} DRONES &nbsp;·&nbsp; {entities.length} ENTITIES
        </p>
      </div>

      {/* Floating Collapsible Legend */}
      <div className="absolute bottom-4 left-4 z-20">
        <GridLegend />
      </div>
    </div>
  );
}
