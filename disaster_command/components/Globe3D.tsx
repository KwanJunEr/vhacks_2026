"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import type { Mesh } from "three";

export default function Globe3D() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Sphere args={[1, 64, 64]} scale={2.5} ref={meshRef}>
      <MeshDistortMaterial
        color="#2563eb"
        attach="material"
        distort={0.4}
        speed={1.5}
        roughness={0.2}
        metalness={0.1}
        wireframe={true}
        transparent={true}
        opacity={0.8}
      />
    </Sphere>
  );
}
