"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function LoadingOverlay() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl"
    >
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <p className="text-sm font-semibold text-slate-600 animate-pulse">
        Initializing Mission Data...
      </p>
    </motion.div>
  );
}
