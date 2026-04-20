"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Network, Scan, MapPin, FileText } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: AlertTriangle,
    title: "Event Trigger",
    description:
      "Disaster event is triggered through API, dataset, or manual input. System initializes grid-based map of affected area.",
  },
  {
    step: "02",
    icon: Network,
    title: "Drone Discovery",
    description:
      "Command Agent discovers available drones via MCP tools, evaluates status, and decomposes mission into optimized sub-tasks.",
  },
  {
    step: "03",
    icon: Scan,
    title: "Autonomous Scanning",
    description:
      "Drones perform local sensing using thermal imaging and YOLOv8 models, streaming data back to centralized system.",
  },
  {
    step: "04",
    icon: MapPin,
    title: "Unified Mapping",
    description:
      "Data continuously merges into a unified disaster map with stigmergy-based coordination to avoid scan duplication.",
  },
  {
    step: "05",
    icon: FileText,
    title: "Mission Report",
    description:
      "Final report summarizes coverage, survivor detections, and resource usage to support emergency responders.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
            Workflow
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From disaster detection to coordinated rescue operations in five
            streamlined phases.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative text-center"
              >
                <div className="relative z-10 mx-auto w-16 h-16 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center mb-4 shadow-lg">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <span className="inline-block text-xs font-bold text-primary mb-2">
                  {step.step}
                </span>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
