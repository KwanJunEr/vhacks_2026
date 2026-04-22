/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ShieldCheck, HeartPulse } from "lucide-react";

type DroneColorKey = "blue" | "red" | "purple" | "green" | "yellow";

const THEMES = {
  blue: {
    primary: "#60a5fa", emissive: "#2563eb",
    bg1: "#0a0f1a", bg2: "#060812", border: "#0d1e38",
    textPrimary: "#e8f4ff", textSub: "#3a6677", textMuted: "#2a4466",
    darkBg: "#0d1e38",
    armColor: "#0d1830", armEmissive: "#000d1a",
    bladeColor: "#001833", bladeEmissive: "#002244",
  },
  red: {
    primary: "#f87171", emissive: "#dc2626",
    bg1: "#1a0a0a", bg2: "#120606", border: "#2e0d0d",
    textPrimary: "#fff0f0", textSub: "#774040", textMuted: "#662a2a",
    darkBg: "#2e0d0d",
    armColor: "#300d0d", armEmissive: "#1a0000",
    bladeColor: "#330000", bladeEmissive: "#440000",
  },
  purple: {
    primary: "#c084fc", emissive: "#9333ea",
    bg1: "#130a1a", bg2: "#0c0612", border: "#220d2e",
    textPrimary: "#f5e8ff", textSub: "#6a3a77", textMuted: "#542a66",
    darkBg: "#220d2e",
    armColor: "#1a0d30", armEmissive: "#0d001a",
    bladeColor: "#180033", bladeEmissive: "#220044",
  },
  green: {
    primary: "#00ff88", emissive: "#00cc66",
    bg1: "#0a1a10", bg2: "#061209", border: "#0d2e18",
    textPrimary: "#e8fff4", textSub: "#3a7755", textMuted: "#2a6644",
    darkBg: "#0d2418",
    armColor: "#0d2418", armEmissive: "#001a0d",
    bladeColor: "#003322", bladeEmissive: "#004433",
  },
  yellow: {
    primary: "#fbbf24", emissive: "#d97706",
    bg1: "#1a150a", bg2: "#120e06", border: "#2e250d",
    textPrimary: "#fffbe8", textSub: "#77663a", textMuted: "#66542a",
    darkBg: "#2a2008",
    armColor: "#302510", armEmissive: "#1a1400",
    bladeColor: "#332200", bladeEmissive: "#443300",
  },
} as const;

type Theme = typeof THEMES[DroneColorKey];

function DroneBody({ theme }: { theme: Theme }) {
  const ref = useRef<any>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.04;
    }
  });

  return (
    <group ref={ref}>
      <mesh castShadow>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color={theme.primary} emissive={theme.emissive} emissiveIntensity={0.6} metalness={0.4} roughness={0.2} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={theme.primary} emissive={theme.primary} emissiveIntensity={1.5} transparent opacity={0.7} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.05, 32]} />
        <meshStandardMaterial color={theme.armColor} metalness={0.8} roughness={0.3} emissive={theme.armEmissive} emissiveIntensity={0.3} />
      </mesh>
      <DroneArms theme={theme} />
    </group>
  );
}

function Rotor({ position, theme }: { position: [number, number, number]; theme: Theme }) {
  const blade1 = useRef<any>(null);
  const blade2 = useRef<any>(null);

  useFrame(() => {
    if (blade1.current) blade1.current.rotation.z += 0.35;
    if (blade2.current) blade2.current.rotation.z += 0.35;
  });

  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.04, 0.04, 0.03, 16]} />
        <meshStandardMaterial color={theme.primary} emissive={theme.emissive} emissiveIntensity={0.8} />
      </mesh>
      <mesh ref={blade1} position={[0, 0.02, 0]}>
        <boxGeometry args={[0.28, 0.01, 0.05]} />
        <meshStandardMaterial color={theme.bladeColor} metalness={0.6} roughness={0.4} emissive={theme.bladeEmissive} emissiveIntensity={0.4} transparent opacity={0.85} />
      </mesh>
      <mesh ref={blade2} position={[0, 0.02, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.28, 0.01, 0.05]} />
        <meshStandardMaterial color={theme.bladeColor} metalness={0.6} roughness={0.4} emissive={theme.bladeEmissive} emissiveIntensity={0.4} transparent opacity={0.85} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.15, 0.012, 8, 32]} />
        <meshStandardMaterial color={theme.primary} emissive={theme.primary} emissiveIntensity={0.5} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

function DroneArms({ theme }: { theme: Theme }) {
  const armPositions: { arm: [number, number, number]; rotor: [number, number, number] }[] = [
    { arm: [0.3, 0, 0.3],   rotor: [0.55, 0.06, 0.55] },
    { arm: [-0.3, 0, 0.3],  rotor: [-0.55, 0.06, 0.55] },
    { arm: [0.3, 0, -0.3],  rotor: [0.55, 0.06, -0.55] },
    { arm: [-0.3, 0, -0.3], rotor: [-0.55, 0.06, -0.55] },
  ];

  return (
    <>
      {armPositions.map((item, i) => (
        <group key={i}>
          <mesh position={item.arm} rotation={[0, i % 2 === 0 ? Math.PI / 4 : -Math.PI / 4, 0]}>
            <boxGeometry args={[0.45, 0.03, 0.04]} />
            <meshStandardMaterial color={theme.armColor} metalness={0.7} roughness={0.3} emissive={theme.armEmissive} />
          </mesh>
          <Rotor position={item.rotor} theme={theme} />
        </group>
      ))}
    </>
  );
}

function ParticleRing({ primary }: { primary: string }) {
  const points = useRef<any>(null);
  const count = 60;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 0.9 + (Math.random() - 0.5) * 0.3;
      arr[i * 3]     = Math.cos(angle) * r;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
      arr[i * 3 + 2] = Math.sin(angle) * r;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (points.current) points.current.rotation.y = state.clock.elapsedTime * 0.3;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={primary} size={0.025} transparent opacity={0.6} />
    </points>
  );
}

function GroundGlow({ primary }: { primary: string }) {
  const ref = useRef<any>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.material.opacity = 0.12 + Math.sin(state.clock.elapsedTime * 2) * 0.06;
    }
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <circleGeometry args={[0.8, 64]} />
      <meshBasicMaterial color={primary} transparent opacity={0.15} />
    </mesh>
  );
}

function DroneScene({ theme }: { theme: Theme }) {
  const groupRef = useRef<any>(null);
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = state.clock.elapsedTime * 0.4;
  });

  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 2, 0]}   intensity={2}   color={theme.primary} />
      <pointLight position={[2, 0, 2]}   intensity={0.8} color={theme.emissive} />
      <pointLight position={[-2, 0, -2]} intensity={0.5} color={theme.emissive} />
      <group ref={groupRef}>
        <DroneBody theme={theme} />
        <ParticleRing primary={theme.primary} />
      </group>
      <GroundGlow primary={theme.primary} />
    </>
  );
}

function ProgressBar({ value = 80, theme }: { value?: number; theme: Theme }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${theme.primary}22` }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(to right, ${theme.emissive}, ${theme.primary})`,
            boxShadow: `0 0 8px ${theme.primary}`,
          }}
        />
      </div>
      <span className="text-[11px] font-bold min-w-[30px]" style={{ color: theme.primary }}>
        {value}%
      </span>
    </div>
  );
}

export default function DroneCard({
  id = "1",
  name = "Hawk Beta",
  model = "DRONE_BRAVO",
  profile = "Survey Pro X",
  battery = 80,
  status = "IDLE",
  health = "Optimal",
  brand = "SkyeNet",
  color = "blue",
}: {
  id?: string;
  name?: string;
  model?: string;
  profile?: string;
  battery?: number;
  status?: string;
  health?: string;
  brand?: string;
  color?: string;
}) {
  const themeKey = (color in THEMES ? color : "blue") as DroneColorKey;
  const theme = THEMES[themeKey];

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="w-full max-w-[320px] rounded-2xl overflow-hidden font-mono shadow-2xl"
      style={{
        background: `linear-gradient(to bottom right, ${theme.bg1}, ${theme.bg2})`,
        border: `1px solid ${theme.border}`,
      }}
    >
      <div className="relative h-[200px]">
        <div
          className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full px-3 py-1 backdrop-blur-md"
          style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${theme.border}` }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: theme.primary, boxShadow: `0 0 6px ${theme.primary}` }}
          />
          <span className="text-[10px] tracking-widest uppercase" style={{ color: `${theme.textPrimary}cc` }}>
            {status}
          </span>
        </div>

        <Canvas camera={{ position: [0, 0.5, 2.2], fov: 45 }} gl={{ alpha: true, antialias: true }}>
          <DroneScene theme={theme} />
        </Canvas>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <h3 className="text-lg font-bold tracking-tight" style={{ color: theme.textPrimary }}>{name}</h3>
            <p className="text-[11px] uppercase tracking-wider" style={{ color: theme.textSub }}>{brand} • {profile}</p>
          </div>
          <span
            className="text-[10px] px-2 py-0.5 rounded"
            style={{ color: theme.textMuted, backgroundColor: theme.darkBg, border: `1px solid ${theme.border}` }}
          >
            {model}
          </span>
        </div>

        <div
          className="grid grid-cols-2 gap-4 py-2"
          style={{ borderTop: `1px solid ${theme.border}66`, borderBottom: `1px solid ${theme.border}66` }}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5" style={{ color: theme.textMuted }} />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase" style={{ color: theme.textMuted }}>ID TAG</span>
              <span className="text-[11px] font-bold" style={{ color: `${theme.textPrimary}cc` }}>#DR-{id}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HeartPulse className="w-3.5 h-3.5" style={{ color: theme.textMuted }} />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase" style={{ color: theme.textMuted }}>HEALTH</span>
              <span className="text-[11px] font-bold uppercase" style={{ color: theme.primary }}>{health}</span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[9px] uppercase font-bold" style={{ color: theme.textMuted }}>
            <span>Power Reserve</span>
          </div>
          <ProgressBar value={battery} theme={theme} />
        </div>

        <Link href={`/fleet/${id}`}>
          <button
            className="w-full mt-2 group flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all"
            style={{
              backgroundColor: theme.darkBg,
              color: theme.primary,
              border: `1px solid ${theme.primary}22`,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.border = `1px solid ${theme.primary}55`)}
            onMouseLeave={(e) => (e.currentTarget.style.border = `1px solid ${theme.primary}22`)}
          >
            VIEW ANALYTICS
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
