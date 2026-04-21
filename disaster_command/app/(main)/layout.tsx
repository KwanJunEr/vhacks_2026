"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Radar,
  Map as MapIcon,
  Database,
  Plane,
  BarChart3,
  FileText,
  BookOpenText,
  Settings,
  Bell,
  Menu,
  X,
  Search,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserDropdown } from "@/components/login/UserDropdown";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Radar },
  { name: "Disaster Events", href: "/events", icon: MapIcon },
  { name: "Drone Fleet", href: "/fleet", icon: Plane },
  { name: "Datasets", href: "/datasets", icon: Database },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Resources", href: "/resources", icon: BookOpenText },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto shadow-sm",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-border shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground">
            Command<span className="text-primary">Grid</span>
          </span>
          <button
            className="ml-auto lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col flex-1 overflow-y-auto py-6 px-4 gap-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
            Main Menu
          </div>

          {navigation.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname?.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 border",
                  isActive
                    ? "bg-accent text-accent-foreground border-border shadow-sm"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground border-transparent",
                )}
              >
                <Icon
                  className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <span className="flex-1">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border shrink-0">
          <UserDropdown user={user} />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 shadow-sm shrink-0">
          <button
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 max-w-xl ml-4 lg:ml-0">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-1.5 border border-border rounded-md bg-muted/50 text-foreground placeholder-muted-foreground focus:outline-none focus:bg-background focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-all shadow-inner"
                placeholder="Search events, drones, or personnel..."
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors hover:bg-accent">
              <span className="sr-only">View notifications</span>
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-destructive ring-2 ring-background animate-pulse" />
            </button>
            <div className="h-6 w-px bg-border mx-1" />
            <UserDropdown user={user} />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
          {children}
        </main>
      </div>
    </div>
  );
}
