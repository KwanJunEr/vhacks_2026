"use client";

import React, { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, RotateCw, ChevronUp, ChevronDown } from "lucide-react";

type DroneColorKey = "blue" | "red" | "purple" | "green" | "yellow";

const THEMES = {
  blue:   { primary: "#60a5fa", emissive: "#2563eb", bg1: "#0a0f1a", bg2: "#060812", border: "#0d1e38", armColor: "#0d1830", armEmissive: "#000d1a", bladeColor: "#001833", bladeEmissive: "#002244" },
  red:    { primary: "#f87171", emissive: "#dc2626", bg1: "#1a0a0a", bg2: "#120606", border: "#2e0d0d", armColor: "#300d0d", armEmissive: "#1a0000", bladeColor: "#330000", bladeEmissive: "#440000" },
  purple: { primary: "#c084fc", emissive: "#9333ea", bg1: "#130a1a", bg2: "#0c0612", border: "#220d2e", armColor: "#1a0d30", armEmissive: "#0d001a", bladeColor: "#180033", bladeEmissive: "#220044" },
  green:  { primary: "#00ff88", emissive: "#00cc66", bg1: "#0a1a10", bg2: "#061209", border: "#0d2e18", armColor: "#0d2418", armEmissive: "#001a0d", bladeColor: "#003322", bladeEmissive: "#004433" },
  yellow: { primary: "#fbbf24", emissive: "#d97706", bg1: "#1a150a", bg2: "#120e06", border: "#2e250d", armColor: "#302510", armEmissive: "#1a1400", bladeColor: "#332200", bladeEmissive: "#443300" },
} as const;

type Theme = typeof THEMES[DroneColorKey];

function Rotor({ position, theme, speedMult = 1 }: { position: [number, number, number]; theme: Theme; speedMult?: number }) {
  const blade1 = useRef<any>(null);
  const blade2 = useRef<any>(null);
  useFrame(() => {
    if (blade1.current) blade1.current.rotation.z += 0.35 * speedMult;
    if (blade2.current) blade2.current.rotation.z += 0.35 * speedMult;
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

function DroneBody({ theme }: { theme: Theme }) {
  const ref = useRef<any>(null);
  useFrame((state) => {
    if (ref.current) ref.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.04;
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
    if (ref.current) ref.current.material.opacity = 0.12 + Math.sin(state.clock.elapsedTime * 2) * 0.06;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <circleGeometry args={[0.8, 64]} />
      <meshBasicMaterial color={primary} transparent opacity={0.15} />
    </mesh>
  );
}

function ControlledDroneScene({
  theme,
  position,
  rotationY,
}: {
  theme: Theme;
  position: [number, number, number];
  rotationY: number;
}) {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 2, 0]}   intensity={2}   color={theme.primary} />
      <pointLight position={[2, 0, 2]}   intensity={0.8} color={theme.emissive} />
      <pointLight position={[-2, 0, -2]} intensity={0.5} color={theme.emissive} />
      <group position={position} rotation={[0, rotationY, 0]}>
        <DroneBody theme={theme} />
        <ParticleRing primary={theme.primary} />
      </group>
      <GroundGlow primary={theme.primary} />
    </>
  );
}

const STEP = 0.2;
const ROT_STEP = Math.PI / 8;

export default function DroneViewer3D({
  color = "blue",
  status = "idle",
}: {
  color?: string;
  status?: string;
}) {
  const themeKey = (color in THEMES ? color : "blue") as DroneColorKey;
  const theme = THEMES[themeKey];

  const [pos, setPos] = useState<[number, number, number]>([0, 0, 0]);
  const [rotY, setRotY] = useState(0);

  const move = (dx: number, dy: number, dz: number) =>
    setPos(([x, y, z]) => [x + dx, y + dy, z + dz]);
  const rotate = (dr: number) => setRotY((r) => r + dr);
  const reset = () => { setPos([0, 0, 0]); setRotY(0); };

  const btnBase =
    "flex items-center justify-center rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 select-none cursor-pointer";
  const btnStyle = {
    background: `${theme.primary}18`,
    borderColor: `${theme.primary}40`,
    color: theme.primary,
  };
  const btnHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLButtonElement).style.background = `${theme.primary}30`;
  };
  const btnLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLButtonElement).style.background = `${theme.primary}18`;
  };

  return (
    <div
      className="rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      style={{ background: `linear-gradient(to bottom right, ${theme.bg1}, ${theme.bg2})`, border: `1px solid ${theme.border}` }}
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: `${theme.primary}66` }}>
          Holographic Telemetry
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.primary, boxShadow: `0 0 6px ${theme.primary}` }} />
          <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: `${theme.primary}aa` }}>{status}</span>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="h-[320px] w-full">
        <Canvas camera={{ position: [0, 0.8, 2.8], fov: 45 }} gl={{ alpha: true, antialias: true }}>
          <ControlledDroneScene theme={theme} position={pos} rotationY={rotY} />
        </Canvas>
      </div>

      {/* Controls */}
      <div className="px-5 pb-5 pt-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: `${theme.primary}55` }}>
            Movement Controls
          </span>
          <button
            onClick={reset}
            className={`${btnBase} px-3 py-1 text-[9px]`}
            style={btnStyle}
            onMouseEnter={btnHover}
            onMouseLeave={btnLeave}
          >
            Reset
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* D-Pad */}
          <div className="space-y-2">
            <p className="text-[8px] uppercase tracking-widest font-bold" style={{ color: `${theme.primary}44` }}>Horizontal</p>
            <div className="grid grid-cols-3 gap-1.5">
              <div />
              <button className={`${btnBase} py-2.5`} style={btnStyle} onMouseEnter={btnHover} onMouseLeave={btnLeave} onClick={() => move(0, 0, -STEP)}>
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <div />
              <button className={`${btnBase} py-2.5`} style={btnStyle} onMouseEnter={btnHover} onMouseLeave={btnLeave} onClick={() => move(-STEP, 0, 0)}>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `${theme.primary}44` }} />
              </div>
              <button className={`${btnBase} py-2.5`} style={btnStyle} onMouseEnter={btnHover} onMouseLeave={btnLeave} onClick={() => move(STEP, 0, 0)}>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div />
              <button className={`${btnBase} py-2.5`} style={btnStyle} onMouseEnter={btnHover} onMouseLeave={btnLeave} onClick={() => move(0, 0, STEP)}>
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <div />
            </div>
          </div>

          {/* Altitude + Rotation */}
          <div className="space-y-2">
            <p className="text-[8px] uppercase tracking-widest font-bold" style={{ color: `${theme.primary}44` }}>Altitude & Yaw</p>
            <div className="grid grid-cols-2 gap-1.5">
              <button className={`${btnBase} py-2.5 flex-col gap-0.5`} style={btnStyle} onMouseEnter={btnHover} onMouseLeave={btnLeave} onClick={() => move(0, STEP, 0)}>
                <ChevronUp className="w-3.5 h-3.5" />
                <span className="text-[8px]">Up</span>
              </button>
              <button className={`${btnBase} py-2.5 flex-col gap-0.5`} style={btnStyle} onMouseEnter={btnHover} onMouseLeave={btnLeave} onClick={() => move(0, -STEP, 0)}>
                <ChevronDown className="w-3.5 h-3.5" />
                <span className="text-[8px]">Down</span>
              </button>
              <button className={`${btnBase} py-2.5 flex-col gap-0.5`} style={btnStyle} onMouseEnter={btnHover} onMouseLeave={btnLeave} onClick={() => rotate(-ROT_STEP)}>
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-[8px]">Yaw L</span>
              </button>
              <button className={`${btnBase} py-2.5 flex-col gap-0.5`} style={btnStyle} onMouseEnter={btnHover} onMouseLeave={btnLeave} onClick={() => rotate(ROT_STEP)}>
                <RotateCw className="w-3.5 h-3.5" />
                <span className="text-[8px]">Yaw R</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
