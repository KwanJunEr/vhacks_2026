"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Radar,
  Map as MapIcon,
  Database,
  Plane,
  BarChart3,
  FileText,
  Settings,
  Bell,
  Menu,
  X,
  Search,
  User,
  Activity,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Radar },
  { name: "Disaster Events", href: "/events", icon: MapIcon },
  { name: "Drone Fleet", href: "/fleet", icon: Plane },
  { name: "Datasets", href: "/analytics", icon: Database },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Computer Vision", href: "/dashboard/computer-vision", icon: Eye },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/dashboard", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
          "fixed inset-y-0 left-0 z-50 bg-card border-r border-border transform transition-all duration-300 lg:translate-x-0 lg:static lg:inset-auto lg:flex lg:flex-col shadow-sm",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-20" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3 h-16 border-b border-border transition-all",
            isCollapsed ? "px-4 justify-center" : "px-6",
          )}
        >
          <div className="w-8 h-8 min-w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg tracking-tight text-foreground transition-opacity duration-300 opacity-100">
              Command<span className="text-primary">Grid</span>
            </span>
          )}

          {/* Collapse Toggle - Desktop only */}
          <button
            className={cn(
              "ml-auto p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent hidden lg:flex",
              isCollapsed && "ml-0",
            )}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Close button - Mobile only */}
          <button
            className="ml-auto lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          className={cn(
            "flex flex-col flex-1 overflow-y-auto py-6 px-4 gap-1",
            isCollapsed && "px-3",
          )}
        >
          {!isCollapsed && (
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
              Main Menu
            </div>
          )}
          {navigation.map((item) => {
            // Determine if active - exact match for dashboard, startsWith for others
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname?.startsWith(item.href);
            const Icon = item.icon;

            const linkContent = (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center text-sm font-medium rounded-lg transition-all duration-200",
                  isCollapsed ? "justify-center p-3" : "px-4 py-3",
                  isActive
                    ? "bg-accent text-accent-foreground border border-border shadow-sm"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground border border-transparent",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                    !isCollapsed && "mr-3",
                  )}
                />
                {!isCollapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </>
                )}
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.name} delayDuration={0}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.name}</TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </div>

        <div
          className={cn(
            "p-4 border-t border-border transition-all",
            isCollapsed && "p-3",
          )}
        >
          <div
            className={cn(
              "bg-accent/50 rounded-lg border border-border transition-all overflow-hidden",
              isCollapsed ? "p-2" : "p-4",
            )}
          >
            <div
              className={cn(
                "flex items-center transition-all",
                isCollapsed ? "justify-center" : "gap-3",
              )}
            >
              <div className="w-10 h-10 min-w-10 rounded-full bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-primary-foreground font-bold shadow-md">
                CM
              </div>
              {!isCollapsed && (
                <div className="transition-all duration-300 opacity-100">
                  <div className="text-sm font-medium text-foreground">
                    Commander
                  </div>
                  <div className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 shadow-sm">
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
                className="block w-full pl-10 pr-3 py-1.5 border border-border rounded-md leading-5 bg-muted/50 text-foreground placeholder-muted-foreground focus:outline-none focus:bg-background focus:placeholder-muted-foreground/50 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-all shadow-inner"
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
            <button className="flex items-center gap-2 p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors">
              <User className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
