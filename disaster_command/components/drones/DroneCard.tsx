/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ShieldCheck, HeartPulse } from "lucide-react";

// ── Drone Body (central sphere) ──────────────────────────────────────────────
function DroneBody() {
  const ref = useRef<any>();
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.04;
    }
  });

  return (
    <group ref={ref}>
      {/* Central dome */}
      <mesh castShadow>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00cc66"
          emissiveIntensity={0.6}
          metalness={0.4}
          roughness={0.2}
        />
      </mesh>

      {/* Inner glowing core */}
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color="#88ffcc"
          emissive="#44ffaa"
          emissiveIntensity={1.5}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Flat body disc */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.05, 32]} />
        <meshStandardMaterial
          color="#0a1a14"
          metalness={0.8}
          roughness={0.3}
          emissive="#003322"
          emissiveIntensity={0.3}
        />
      </mesh>

      <DroneArms />
    </group>
  );
}

function Rotor({ position }: { position: [number, number, number] }) {
  const blade1 = useRef<any>();
  const blade2 = useRef<any>();

  useFrame(() => {
    if (blade1.current) blade1.current.rotation.z += 0.35;
    if (blade2.current) blade2.current.rotation.z += 0.35;
  });

  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.04, 0.04, 0.03, 16]} />
        <meshStandardMaterial color="#00ff88" emissive="#00bb55" emissiveIntensity={0.8} />
      </mesh>

      <mesh ref={blade1} position={[0, 0.02, 0]}>
        <boxGeometry args={[0.28, 0.01, 0.05]} />
        <meshStandardMaterial
          color="#003322"
          metalness={0.6}
          roughness={0.4}
          emissive="#004433"
          emissiveIntensity={0.4}
          transparent
          opacity={0.85}
        />
      </mesh>

      <mesh ref={blade2} position={[0, 0.02, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.28, 0.01, 0.05]} />
        <meshStandardMaterial
          color="#003322"
          metalness={0.6}
          roughness={0.4}
          emissive="#004433"
          emissiveIntensity={0.4}
          transparent
          opacity={0.85}
        />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.15, 0.012, 8, 32]} />
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={0.5}
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  );
}

function DroneArms() {
  const armPositions: { arm: [number, number, number]; rotor: [number, number, number] }[] = [
    { arm: [0.3, 0, 0.3], rotor: [0.55, 0.06, 0.55] },
    { arm: [-0.3, 0, 0.3], rotor: [-0.55, 0.06, 0.55] },
    { arm: [0.3, 0, -0.3], rotor: [0.55, 0.06, -0.55] },
    { arm: [-0.3, 0, -0.3], rotor: [-0.55, 0.06, -0.55] },
  ];

  return (
    <>
      {armPositions.map((item, i) => (
        <group key={i}>
          <mesh position={item.arm} rotation={[0, i % 2 === 0 ? Math.PI / 4 : -Math.PI / 4, 0]}>
            <boxGeometry args={[0.45, 0.03, 0.04]} />
            <meshStandardMaterial
              color="#0d2418"
              metalness={0.7}
              roughness={0.3}
              emissive="#001a0d"
            />
          </mesh>
          <Rotor position={item.rotor} />
        </group>
      ))}
    </>
  );
}

function ParticleRing() {
  const points = useRef<any>();
  const count = 60;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 0.9 + (Math.random() - 0.5) * 0.3;
      arr[i * 3] = Math.cos(angle) * r;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
      arr[i * 3 + 2] = Math.sin(angle) * r;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#00ff88" size={0.025} transparent opacity={0.6} />
    </points>
  );
}

function GroundGlow() {
  const ref = useRef<any>();
  useFrame((state) => {
    if (ref.current) {
      ref.current.material.opacity = 0.12 + Math.sin(state.clock.elapsedTime * 2) * 0.06;
    }
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <circleGeometry args={[0.8, 64]} />
      <meshBasicMaterial color="#00ff88" transparent opacity={0.15} />
    </mesh>
  );
}

function DroneScene() {
  const groupRef = useRef<any>();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.4;
    }
  });

  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 2, 0]} intensity={2} color="#00ff88" />
      <pointLight position={[2, 0, 2]} intensity={0.8} color="#004422" />
      <pointLight position={[-2, 0, -2]} intensity={0.5} color="#002211" />

      <group ref={groupRef}>
        <DroneBody />
        <ParticleRing />
      </group>

      <GroundGlow />
    </>
  );
}

function ProgressBar({ value = 80 }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-1.5 bg-[#0d2418] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-[#00cc55] to-[#00ff88] rounded-full shadow-[0_0_8px_#00ff88]"
        />
      </div>
      <span className="text-[#00ff88] text-[11px] font-bold min-w-[30px]">
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
  brand = "SkyeNet"
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="w-full max-w-[320px] bg-gradient-to-br from-[#0a1a10] to-[#061209] border border-[#0d2e18] rounded-2xl overflow-hidden font-mono shadow-2xl"
    >
      <div className="relative h-[200px]">
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-black/40 border border-[#0d2e18] rounded-full px-3 py-1 backdrop-blur-md">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] shadow-[0_0_6px_#00ff88] animate-pulse" />
          <span className="text-[#aaccbb] text-[10px] tracking-widest uppercase">
            {status}
          </span>
        </div>

        <Canvas camera={{ position: [0, 0.5, 2.2], fov: 45 }} gl={{ alpha: true, antialias: true }}>
          <DroneScene />
        </Canvas>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <h3 className="text-[#e8fff4] text-lg font-bold tracking-tight">{name}</h3>
            <p className="text-[#3a7755] text-[11px] uppercase tracking-wider">{brand} • {profile}</p>
          </div>
          <span className="text-[#2a6644] text-[10px] bg-[#0d2418] px-2 py-0.5 rounded border border-[#0d2e18]">
            {model}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 py-2 border-y border-[#0d2e18]/30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2a6644]" />
            <div className="flex flex-col">
              <span className="text-[9px] text-[#2a6644] uppercase">ID TAG</span>
              <span className="text-[11px] text-[#aaccbb] font-bold">#DR-{id}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HeartPulse className="w-3.5 h-3.5 text-[#2a6644]" />
            <div className="flex flex-col">
              <span className="text-[9px] text-[#2a6644] uppercase">HEALTH</span>
              <span className="text-[11px] text-[#00ff88] font-bold uppercase">{health}</span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[9px] text-[#2a6644] uppercase font-bold">
            <span>Power Reserve</span>
          </div>
          <ProgressBar value={battery} />
        </div>

        <Link href={`/dashboard/fleet/${id}`}>
          <button className="w-full mt-2 group flex items-center justify-center gap-2 py-2.5 bg-[#0d2e18] hover:bg-[#124225] text-[#00ff88] text-xs font-bold rounded-xl transition-all border border-[#00ff88]/10 hover:border-[#00ff88]/30">
            VIEW ANALYTICS
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
