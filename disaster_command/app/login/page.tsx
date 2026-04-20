"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { LoginSuccessModal } from "@/components/login/LoginSuccessModal";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user info in localStorage or cookie if needed
        localStorage.setItem("user", JSON.stringify(data.user));
        setLoggedInUser(data.user);
        setIsSuccessModalOpen(true);
        // We'll let the user click the button in the modal to proceed,
        // or redirect after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } else {
        setError(
          data.detail ||
            "Authentication failed. Please check your credentials.",
        );
      }
    } catch (err) {
      setError(
        "Unable to connect to the authentication server. Please ensure the backend is running.",
      );
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
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
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-slate-500 mt-2">Access the Global Command Grid</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-slate-200 shadow-xl backdrop-blur-xl bg-white/60">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" />
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Secure ID / Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                <input
                  type="email"
                  className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400 shadow-sm"
                  placeholder="commander@vhacks.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Access Key
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-12 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400 shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
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
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Return to Public Portal
            </Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 text-xs text-slate-500 text-center">
          <div className="border border-slate-200 bg-white/50 rounded px-2 py-1">
            System Status:{" "}
            <span className="text-emerald-600 font-medium">Normal</span>
          </div>
          <div className="border border-slate-200 bg-white/50 rounded px-2 py-1">
            Encryption:{" "}
            <span className="text-blue-600 font-medium">AES-256</span>
          </div>
        </div>
      </motion.div>

      <LoginSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => router.push("/dashboard")}
        userName={loggedInUser?.name || "Commander"}
      />
    </div>
  );
}
