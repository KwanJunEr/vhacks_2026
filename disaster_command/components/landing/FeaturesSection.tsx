"use client";

import { motion } from "framer-motion";
import {
  Cpu,
  Map,
  Radar,
  Radio,
  Brain,
  Grid3X3,
} from "lucide-react";

const features = [
  {
    icon: Cpu,
    title: "MCP Multi-Agent Architecture",
    description:
      "Decentralized command structure with autonomous agent coordination for seamless disaster response operations.",
  },
  {
    icon: Radar,
    title: "Real-Time Drone Swarm",
    description:
      "Dynamically discovers and coordinates available drones, evaluating status, location, battery, and capabilities.",
  },
  {
    icon: Map,
    title: "Grid-Based Mapping",
    description:
      "Initializes affected areas into optimized grid sectors for systematic scanning and survivor detection.",
  },
  {
    icon: Radio,
    title: "Thermal & CV Sensing",
    description:
      "Advanced thermal imaging and YOLOv8 computer vision models for accurate survivor and hazard detection.",
  },
  {
    icon: Brain,
    title: "AI Reasoning Layer",
    description:
      "Continuous analysis of incoming data to detect survivors, trigger replanning, and reassign drones in real-time.",
  },
  {
    icon: Grid3X3,
    title: "Stigmergy Coordination",
    description:
      "Drones indirectly collaborate by marking scanned regions on shared maps to avoid duplication and improve efficiency.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
            Core Capabilities
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Intelligent Disaster Response
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powered by autonomous drone swarms and advanced AI coordination for
            real-time crisis management.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
             
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
