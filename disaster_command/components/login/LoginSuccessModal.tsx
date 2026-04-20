"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";

interface LoginSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export function LoginSuccessModal({
  isOpen,
  onClose,
  userName,
}: LoginSuccessModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Login Successful
            </h3>
            <p className="text-slate-500 mb-8">
              Welcome back,{" "}
              <span className="font-semibold text-slate-700">{userName}</span>.
              Redirecting you to the Command Grid.
            </p>

            <Button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl font-medium flex items-center justify-center gap-2 group transition-all"
            >
              Enter Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
