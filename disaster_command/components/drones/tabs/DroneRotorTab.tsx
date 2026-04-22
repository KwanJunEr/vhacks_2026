"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

interface DroneRotorTabProps {
  rotor_1_rpm?: number | null;
  rotor_2_rpm?: number | null;
  rotor_3_rpm?: number | null;
  rotor_4_rpm?: number | null;
}

const MAX_RPM = 6000;

const ROTOR_POSITIONS: [number, number, number][] = [
  [-0.7, 0, -0.7],
  [0.7,  0, -0.7],
  [-0.7, 0,  0.7],
  [0.7,  0,  0.7],
];

const ROTOR_LABELS = ["Rotor 1 (FL)", "Rotor 2 (FR)", "Rotor 3 (RL)", "Rotor 4 (RR)"];
const ROTOR_COLORS = ["#60a5fa", "#f87171", "#a78bfa", "#34d399"];

function RotorMotor({
  position,
  rpm,
  color,
}: {
  position: [number, number, number];
  rpm: number;
  color: string;
}) {
  const blade1 = useRef<any>(null);
  const blade2 = useRef<any>(null);
  const speed = (rpm / MAX_RPM) * 0.6;

  useFrame(() => {
    if (blade1.current) blade1.current.rotation.y += speed;
    if (blade2.current) blade2.current.rotation.y += speed;
  });

  return (
    <group position={position}>
      {/* Motor hub */}
      <mesh>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Guard ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.28, 0.02, 8, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} transparent opacity={0.5} />
      </mesh>
      {/* Blade 1 */}
      <mesh ref={blade1} position={[0, 0.05, 0]}>
        <boxGeometry args={[0.44, 0.01, 0.08]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} transparent opacity={0.9} />
      </mesh>
      {/* Blade 2 */}
      <mesh ref={blade2} position={[0, 0.05, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.44, 0.01, 0.08]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} transparent opacity={0.9} />
      </mesh>
      {/* RPM glow */}
      <pointLight position={[0, 0.3, 0]} intensity={rpm / MAX_RPM * 1.5} color={color} distance={1} />
    </group>
  );
}

function RotorScene({ rpms }: { rpms: number[] }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[2, 4, 2]} intensity={0.8} />
      {/* Frame */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[2.2, 2.2]} />
        <meshStandardMaterial color="#0f172a" metalness={0.2} roughness={0.8} transparent opacity={0.6} />
      </mesh>
      {/* Arms */}
      {ROTOR_POSITIONS.map((pos, i) => (
        <mesh key={i} position={[pos[0] / 2, 0, pos[2] / 2]} rotation={[0, i % 2 === 0 ? Math.PI / 4 : -Math.PI / 4, 0]}>
          <boxGeometry args={[0.85, 0.04, 0.06]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      {/* Center body */}
      <mesh>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Rotors */}
      {ROTOR_POSITIONS.map((pos, i) => (
        <RotorMotor key={i} position={pos} rpm={rpms[i]} color={ROTOR_COLORS[i]} />
      ))}
    </>
  );
}

function RpmBar({ rpm, color, label }: { rpm: number; color: string; label: string }) {
  const pct = Math.min((rpm / MAX_RPM) * 100, 100);
  const isHigh = rpm > MAX_RPM * 0.8;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-xs font-bold text-slate-700">{label}</span>
        </div>
        <span className={`text-xs font-black ${isHigh ? "text-amber-600" : "text-slate-600"}`}>
          {rpm.toLocaleString()} RPM
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
        />
      </div>
    </div>
  );
}

export default function DroneRotorTab({
  rotor_1_rpm = 0,
  rotor_2_rpm = 0,
  rotor_3_rpm = 0,
  rotor_4_rpm = 0,
}: DroneRotorTabProps) {
  const rpms = [rotor_1_rpm ?? 0, rotor_2_rpm ?? 0, rotor_3_rpm ?? 0, rotor_4_rpm ?? 0];
  const avgRpm = Math.round(rpms.reduce((a, b) => a + b, 0) / 4);

  return (
    <div className="space-y-6">
      {/* 3D rotor view */}
      <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm" style={{ height: 240, background: "#0a0f1a" }}>
        <Canvas camera={{ position: [0, 2.2, 2.2], fov: 50 }} gl={{ alpha: false, antialias: true }}>
          <RotorScene rpms={rpms} />
        </Canvas>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Avg RPM</p>
          <p className="text-2xl font-black text-slate-800">{avgRpm.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Max RPM</p>
          <p className="text-2xl font-black text-slate-800">{Math.max(...rpms).toLocaleString()}</p>
        </div>
      </div>

      {/* Per-rotor bars */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm">
        {rpms.map((rpm, i) => (
          <RpmBar key={i} rpm={rpm} color={ROTOR_COLORS[i]} label={ROTOR_LABELS[i]} />
        ))}
      </div>
    </div>
  );
}
