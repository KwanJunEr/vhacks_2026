"use client";

import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, ThreeElements } from "@react-three/fiber";
import { OrbitControls, Text, Billboard } from "@react-three/drei";
import * as THREE from "three";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GridDrone {
  id: string;
  name: string;
  status: string;
  battery: number;
  color: string;
  /** 0-100 coordinate range — mapped to 0-19 grid */
  current_x: number;
  current_y: number;
}

export interface GridEntity {
  id: string;
  type: "survivor" | "hazard" | "supply" | "recharge_station";
  name: string | null;
  status: string | null;
  /** Already 0-19 grid coordinates */
  grid_x: number;
  grid_y: number;
  severity?: number | null;
  priority?: number | null;
}

interface ThreeJSGridProps {
  drones: GridDrone[];
  entities: GridEntity[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GRID = 20;
const CELL = 1; // 1 world unit per cell
const HALF = (GRID * CELL) / 2;

function gridToWorld(gx: number, gy: number): [number, number] {
  // gx/gy 0-19 → world -10..+10 centred at origin
  return [gx * CELL - HALF + CELL / 2, gy * CELL - HALF + CELL / 2];
}

function droneToWorld(cx: number, cy: number): [number, number] {
  // cx/cy 0-100 → gx/gy 0-19 → world
  const gx = Math.min(19, Math.max(0, Math.round((cx / 100) * 19)));
  const gy = Math.min(19, Math.max(0, Math.round((cy / 100) * 19)));
  return gridToWorld(gx, gy);
}

const DRONE_COLORS: Record<string, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#eab308",
  purple: "#a855f7",
};

// ─── Grid Floor ───────────────────────────────────────────────────────────────

function GridFloor() {
  const tiles = useMemo(() => {
    const arr: { key: string; x: number; z: number; even: boolean }[] = [];
    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        const [wx, wz] = gridToWorld(c, r);
        arr.push({ key: `${r}-${c}`, x: wx, z: wz, even: (r + c) % 2 === 0 });
      }
    }
    return arr;
  }, []);

  return (
    <group>
      {tiles.map(({ key, x, z, even }) => (
        <mesh key={key} position={[x, 0, z]} receiveShadow>
          <boxGeometry args={[CELL, 0.04, CELL]} />
          <meshStandardMaterial
            color={even ? "#1e293b" : "#0f172a"}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      ))}
      {/* Grid lines overlay */}
      <gridHelper
        args={[GRID * CELL, GRID, "#334155", "#1e3a5f"]}
        position={[0, 0.03, 0]}
      />
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
      out.push({ key: `col-${i}`, text: `${i}`, x: wx, z: HALF + 0.8 });
      out.push({ key: `row-${i}`, text: `${i}`, x: -(HALF + 0.8), z: wz });
    }
    return out;
  }, []);

  return (
    <>
      {labels.map(({ key, text, x, z }) => (
        <Billboard key={key} position={[x, 0.2, z]}>
          <Text fontSize={0.35} color="#64748b" anchorX="center" anchorY="middle">
            {text}
          </Text>
        </Billboard>
      ))}
    </>
  );
}

// ─── Drone 3D Object ──────────────────────────────────────────────────────────

function DroneModel({
  x,
  z,
  color,
  label,
  battery,
  status,
}: {
  x: number;
  z: number;
  color: string;
  label: string;
  battery: number;
  status: string;
}) {
  const rotorRef1 = useRef<THREE.Mesh>(null!);
  const rotorRef2 = useRef<THREE.Mesh>(null!);
  const rotorRef3 = useRef<THREE.Mesh>(null!);
  const rotorRef4 = useRef<THREE.Mesh>(null!);
  const bodyRef = useRef<THREE.Group>(null!);

  const isFlying = !["idle", "returning"].includes(status.toLowerCase());
  const altitude = isFlying ? 0.55 : 0.25;

  useFrame((_, delta) => {
    const speed = isFlying ? 8 : 2;
    [rotorRef1, rotorRef2, rotorRef3, rotorRef4].forEach((r) => {
      if (r.current) r.current.rotation.y += delta * speed;
    });
    if (bodyRef.current) {
      bodyRef.current.position.y +=
        Math.sin(Date.now() * 0.002) * delta * 0.03;
    }
  });

  const hexColor = DRONE_COLORS[color] ?? "#3b82f6";
  const batteryColor = battery > 60 ? "#22c55e" : battery > 30 ? "#f59e0b" : "#ef4444";

  const armLen = 0.28;
  const arms = [
    [armLen, 0, armLen],
    [-armLen, 0, armLen],
    [armLen, 0, -armLen],
    [-armLen, 0, -armLen],
  ] as [number, number, number][];
  const rotorRefs = [rotorRef1, rotorRef2, rotorRef3, rotorRef4];

  return (
    <group position={[x, altitude, z]}>
      <group ref={bodyRef}>
        {/* Body */}
        <mesh castShadow>
          <boxGeometry args={[0.22, 0.08, 0.22]} />
          <meshStandardMaterial color={hexColor} roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Camera dome */}
        <mesh position={[0, -0.06, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Arms + rotors */}
        {arms.map(([ax, ay, az], i) => (
          <group key={i} position={[ax, ay, az]}>
            {/* Arm */}
            <mesh>
              <boxGeometry args={[Math.abs(ax) > 0 ? 0.28 : 0.04, 0.03, Math.abs(az) > 0 ? 0.28 : 0.04]} />
              <meshStandardMaterial color="#334155" roughness={0.6} />
            </mesh>
            {/* Rotor disk */}
            <mesh ref={rotorRefs[i]} position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.01, 12]} />
              <meshStandardMaterial
                color={hexColor}
                transparent
                opacity={0.5}
                roughness={0.1}
              />
            </mesh>
          </group>
        ))}
        {/* Battery indicator bar */}
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[0.2 * (battery / 100), 0.015, 0.04]} />
          <meshStandardMaterial color={batteryColor} emissive={batteryColor} emissiveIntensity={0.4} />
        </mesh>
      </group>

      {/* Label */}
      <Billboard position={[0, 0.55, 0]}>
        <Text fontSize={0.18} color="#f1f5f9" anchorX="center" anchorY="middle"
          outlineWidth={0.02} outlineColor="#0f172a">
          {label}
        </Text>
        <Text fontSize={0.13} color={batteryColor} anchorX="center" anchorY="middle"
          position={[0, -0.2, 0]}>
          {battery}%
        </Text>
      </Billboard>
    </group>
  );
}

// ─── Survivor ─────────────────────────────────────────────────────────────────

function SurvivorMarker({ x, z, status, name }: { x: number; z: number; status: string | null; name: string | null }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const isCritical = status === "critical";

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = 0.35 + Math.sin(state.clock.elapsedTime * 2) * 0.06;
    }
    if (ringRef.current) {
      ringRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.25;
      ringRef.current.scale.z = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.25;
      (ringRef.current.material as THREE.MeshStandardMaterial).opacity = 0.5 - Math.sin(state.clock.elapsedTime * 3) * 0.3;
    }
  });

  const color = isCritical ? "#ef4444" : status === "injured" ? "#f97316" : "#22c55e";

  return (
    <group position={[x, 0, z]}>
      {/* Pulse ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.25, 0.35, 24]} />
        <meshStandardMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      {/* Body capsule */}
      <mesh ref={meshRef} castShadow position={[0, 0.35, 0]}>
        <capsuleGeometry args={[0.12, 0.25, 6, 12]} />
        <meshStandardMaterial color={color} roughness={0.4} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      {/* Pin pole */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 6]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <Billboard position={[0, 0.85, 0]}>
        <Text fontSize={0.15} color="#f1f5f9" anchorX="center" anchorY="middle"
          outlineWidth={0.02} outlineColor="#0f172a">
          {name ?? "Survivor"}
        </Text>
      </Billboard>
    </group>
  );
}

// ─── Hazard ───────────────────────────────────────────────────────────────────

function HazardMarker({ x, z, name }: { x: number; z: number; name: string | null }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.8;
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* Glowing base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.4, 6]} />
        <meshStandardMaterial color="#ef4444" transparent opacity={0.3} />
      </mesh>
      {/* Rotating danger block */}
      <mesh ref={meshRef} position={[0, 0.3, 0]} castShadow>
        <octahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#dc2626"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>
      {/* Warning stripes base */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.08, 6]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.8} />
      </mesh>
      <Billboard position={[0, 0.75, 0]}>
        <Text fontSize={0.15} color="#fbbf24" anchorX="center" anchorY="middle"
          outlineWidth={0.02} outlineColor="#0f172a">
          ⚠ {name ?? "Hazard"}
        </Text>
      </Billboard>
    </group>
  );
}

// ─── Supply ───────────────────────────────────────────────────────────────────

function SupplyMarker({ x, z, name }: { x: number; z: number; name: string | null }) {
  return (
    <group position={[x, 0, z]}>
      {/* Base pad */}
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[0.6, 0.06, 0.6]} />
        <meshStandardMaterial color="#059669" roughness={0.6} />
      </mesh>
      {/* Crate */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[0.38, 0.38, 0.38]} />
        <meshStandardMaterial color="#10b981" roughness={0.5} metalness={0.2}
          emissive="#064e3b" emissiveIntensity={0.3} />
      </mesh>
      {/* Cross lid */}
      <mesh position={[0, 0.48, 0]}>
        <boxGeometry args={[0.36, 0.04, 0.1]} />
        <meshStandardMaterial color="#f0fdf4" />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <boxGeometry args={[0.1, 0.04, 0.36]} />
        <meshStandardMaterial color="#f0fdf4" />
      </mesh>
      <Billboard position={[0, 0.75, 0]}>
        <Text fontSize={0.14} color="#34d399" anchorX="center" anchorY="middle"
          outlineWidth={0.02} outlineColor="#0f172a">
          {name ?? "Supply"}
        </Text>
      </Billboard>
    </group>
  );
}

// ─── Recharge Station ─────────────────────────────────────────────────────────

function RechargeMarker({ x, z, name }: { x: number; z: number; name: string | null }) {
  const boltRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (boltRef.current) {
      (boltRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.4;
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* Platform */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.1, 12]} />
        <meshStandardMaterial color="#1d4ed8" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Energy core */}
      <mesh ref={boltRef} position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 0.45, 6]} />
        <meshStandardMaterial
          color="#60a5fa"
          emissive="#3b82f6"
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
      {/* Antenna */}
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.25, 6]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[0, 0.76, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={1} />
      </mesh>
      <Billboard position={[0, 0.95, 0]}>
        <Text fontSize={0.14} color="#93c5fd" anchorX="center" anchorY="middle"
          outlineWidth={0.02} outlineColor="#0f172a">
          ⚡ {name ?? "Recharge"}
        </Text>
      </Billboard>
    </group>
  );
}

// ─── Scene ────────────────────────────────────────────────────────────────────

function Scene({ drones, entities }: ThreeJSGridProps) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[0, 8, 0]} intensity={0.6} color="#60a5fa" />

      <GridFloor />
      <AxisLabels />

      {/* Entities */}
      {entities.map((ent) => {
        const [wx, wz] = gridToWorld(ent.grid_x, ent.grid_y);
        switch (ent.type) {
          case "survivor":
            return <SurvivorMarker key={ent.id} x={wx} z={wz} status={ent.status} name={ent.name} />;
          case "hazard":
            return <HazardMarker key={ent.id} x={wx} z={wz} name={ent.name} />;
          case "supply":
            return <SupplyMarker key={ent.id} x={wx} z={wz} name={ent.name} />;
          case "recharge_station":
            return <RechargeMarker key={ent.id} x={wx} z={wz} name={ent.name} />;
          default:
            return null;
        }
      })}

      {/* Drones */}
      {drones.map((d) => {
        const [wx, wz] = droneToWorld(d.current_x ?? 0, d.current_y ?? 0);
        return (
          <DroneModel
            key={d.id}
            x={wx}
            z={wz}
            color={d.color}
            label={d.name}
            battery={d.battery}
            status={d.status}
          />
        );
      })}

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={5}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function Legend() {
  const items = [
    { color: "#ef4444", label: "Survivor (Critical)" },
    { color: "#f97316", label: "Survivor (Injured)" },
    { color: "#22c55e", label: "Survivor (Stable)" },
    { color: "#fbbf24", label: "Hazard" },
    { color: "#10b981", label: "Supply Zone" },
    { color: "#60a5fa", label: "Recharge Station" },
    { color: "#a78bfa", label: "Drone" },
  ];

  return (
    <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-xl p-3 z-10">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Legend</p>
      <div className="flex flex-col gap-1.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] text-slate-300 font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Public Component ─────────────────────────────────────────────────────────

export function ThreeJSGrid({ drones, entities }: ThreeJSGridProps) {
  return (
    <div className="relative w-full h-full bg-slate-950 rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [12, 14, 12], fov: 45 }}
        shadows
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <Scene drones={drones} entities={entities} />
        </Suspense>
      </Canvas>

      {/* Controls hint */}
      <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-1.5 z-10">
        <p className="text-[9px] text-slate-400 font-medium">Drag to rotate · Scroll to zoom · Right-drag to pan</p>
      </div>

      <Legend />
    </div>
  );
}
