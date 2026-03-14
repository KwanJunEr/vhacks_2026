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
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Radar },
  { name: "Disaster Events", href: "/dashboard/events", icon: MapIcon },
  { name: "Drone Fleet", href: "/dashboard/fleet", icon: Plane },
  { name: "Datasets", href: "/dashboard/datasets", icon: Database },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Reports", href: "/dashboard/reports", icon: FileText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      <div 
        className={cn(
            "fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity", 
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside 
        className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto lg:flex lg:flex-col shadow-sm",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
             <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">Command<span className="text-blue-600">Grid</span></span>
          <button 
            className="ml-auto lg:hidden text-slate-400 hover:text-slate-600"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto py-6 px-4 gap-1">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Main Menu</div>
            {navigation.map((item) => {
                // Determine if active - exact match for dashboard, startsWith for others
                const isActive = item.href === '/dashboard' 
                    ? pathname === '/dashboard' 
                    : pathname?.startsWith(item.href);
                const Icon = item.icon;
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            "group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                            isActive 
                                ? "bg-blue-50 text-blue-700 border border-blue-100 shadow-sm" 
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        )}
                    >
                        <Icon className={cn("mr-3 h-5 w-5 transition-colors", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                        {item.name}
                        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
                    </Link>
                );
            })}
        </div>
        
        <div className="p-4 border-t border-slate-100">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                        CM
                    </div>
                    <div>
                        <div className="text-sm font-medium text-slate-900">Commander</div>
                        <div className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Online
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-sm">
            <button 
                className="lg:hidden p-2 text-slate-400 hover:text-slate-600"
                onClick={() => setSidebarOpen(true)}
            >
                <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 max-w-xl ml-4 lg:ml-0">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-1.5 border border-slate-200 rounded-md leading-5 bg-slate-100 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:placeholder-slate-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all shadow-inner"
                        placeholder="Search events, drones, or personnel..."
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 rounded-full text-slate-400 hover:text-slate-600 transition-colors hover:bg-slate-100">
                    <span className="sr-only">View notifications</span>
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
                </button>
                <div className="h-6 w-px bg-slate-200 mx-1" />
                <button className="flex items-center gap-2 p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                    <User className="w-5 h-5" />
                </button>
            </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            {children}
        </main>
      </div>
    </div>
  );
}
