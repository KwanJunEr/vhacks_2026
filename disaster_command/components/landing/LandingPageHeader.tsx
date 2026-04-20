"use client";

import Link from "next/link";
import { Activity } from "lucide-react";

export default function LandingPageHeader() {
  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl">
      <div className="bg-card/80 backdrop-blur-xl border border-border rounded-full px-6 h-14 flex items-center justify-between shadow-lg shadow-black/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="hover:text-primary transition-colors">
            How It Works
          </Link>
          <Link href="#dashboard" className="hover:text-primary transition-colors">
            Community
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
  );
}
