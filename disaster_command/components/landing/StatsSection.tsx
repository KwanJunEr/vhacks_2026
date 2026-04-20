"use client";

import { motion } from "framer-motion";

const stats = [
  {
    value: "99.9%",
    label: "System Uptime",
    description: "Mission-critical reliability",
  },
  {
    value: "< 50ms",
    label: "Response Time",
    description: "Real-time data processing",
  },
  {
    value: "500+",
    label: "Drones Supported",
    description: "Per active deployment",
  },
  {
    value: "24/7",
    label: "Monitoring",
    description: "Continuous global coverage",
  },
];

export default function StatsSection() {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold mb-2">
                {stat.value}
              </div>
              <div className="text-lg font-semibold mb-1 text-primary-foreground/90">
                {stat.label}
              </div>
              <div className="text-sm text-primary-foreground/70">
                {stat.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
