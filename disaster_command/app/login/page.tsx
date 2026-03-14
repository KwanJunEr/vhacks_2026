"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100/40 via-slate-50 to-slate-50" />
      <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
      <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 mb-4 border border-blue-200 shadow-sm">
                <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 mt-2">Access the Global Command Grid</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-slate-200 shadow-xl backdrop-blur-xl bg-white/60">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Secure ID / Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                <input 
                  type="email" 
                  className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400 shadow-sm"
                  placeholder="commander@vhacks.com"
                  defaultValue="commander@vhacks.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Access Key</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                <input 
                  type="password" 
                  className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400 shadow-sm"
                  placeholder="••••••••"
                  defaultValue="password"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Connect to Grid
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-slate-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">Return to Public Portal</Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 text-xs text-slate-500 text-center">
             <div className="border border-slate-200 bg-white/50 rounded px-2 py-1">System Status: <span className="text-emerald-600 font-medium">Normal</span></div>
             <div className="border border-slate-200 bg-white/50 rounded px-2 py-1">Encryption: <span className="text-blue-600 font-medium">AES-256</span></div>
        </div>
      </motion.div>
    </div>
  );
}
