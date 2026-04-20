"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { motion } from "framer-motion";
import Globe3D from "@/components/Globe3D";
import { ArrowRight, ShieldCheck, Activity, Globe } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 glass-panel border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tighter text-foreground">
              Disaster<span className="text-primary">Command</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">
              Solutions
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Network
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Resources
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-5 py-2 rounded-full text-sm font-medium border border-primary/20 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative pt-20 flex flex-col items-center justify-center overflow-hidden">
        {/* 3D Background - Adjusted for Light Mode */}
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-multiply pointer-events-none grayscale-[0.2]">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={1.5} />
              <pointLight
                position={[10, 10, 10]}
                intensity={2}
                color="#3b82f6"
              />
              <Globe3D />
              <OrbitControls
                enableZoom={false}
                autoRotate
                autoRotateSpeed={0.5}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-left pointer-events-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Live Disaster Monitoring System
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-foreground">
              Global Command <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">
                Centre
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg font-medium">
              Real-time situational awareness, predictive analytics, and
              coordinated response management for global crisis events.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login" className="cursor-pointer">
                <button className="group relative px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/30 flex items-center gap-2">
                  Enter Command Center
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <button className="px-8 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-accent transition-colors bg-card shadow-sm cursor-pointer">
                View Documentation
              </button>
            </div>

            <div className="mt-12 flex items-center gap-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Secure Grid</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Global Coverage</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">99.9% Uptime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
