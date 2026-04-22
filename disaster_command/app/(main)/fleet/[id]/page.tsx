"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Cpu, Gauge, Activity, Radio, Wrench } from "lucide-react";
import DroneViewer3D from "@/components/drones/DroneViewer3D";
import DroneBasicInfoTab from "@/components/drones/tabs/DroneBasicInfoTab";
import DroneSpecsTab from "@/components/drones/tabs/DroneSpecsTab";
import DroneSignalHealthTab from "@/components/drones/tabs/DroneSignalHealthTab";
import DroneRotorTab from "@/components/drones/tabs/DroneRotorTab";
import DronePredictiveTab from "@/components/drones/tabs/DronePredictiveTab";
import { DroneDetail } from "@/types/DroneDetails";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";



type TabId = "basic" | "specs" | "signal" | "rotors" | "predictive";

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "basic",      label: "Basic Info",   icon: Cpu },
  { id: "specs",      label: "Specs",        icon: Gauge },
  { id: "signal",     label: "Signal Health", icon: Activity },
  { id: "rotors",     label: "Rotors",       icon: Radio },
  { id: "predictive", label: "Maintenance",  icon: Wrench },
];

export default function DroneDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [drone, setDrone] = useState<DroneDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("basic");

  useEffect(() => {
    const fetchDrone = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/drones/${params.id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setDrone(data);
      } catch {
        setDrone(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDrone();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-blue-500 font-mono text-sm tracking-widest animate-pulse">ACCESSING ENCRYPTED DATA...</p>
      </div>
    );
  }

  if (!drone) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500 font-mono text-sm tracking-widest">DRONE UNIT NOT FOUND</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Back nav */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-xs uppercase tracking-widest"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Swarm
      </button>

      {/* Page header */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{drone.drone_name}</h1>
          <p className="text-slate-500 font-medium text-sm mt-0.5">
            {drone.brand_name} · {drone.weight_class} · ID #{drone.id}
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

        {/* LEFT: 3D viewer */}
        <div className="lg:col-span-2">
          <DroneViewer3D color={drone.color} status={drone.status} />
        </div>

        {/* RIGHT: Tabbed info panel */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 text-[11px] font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all shrink-0 ${
                    isActive
                      ? "border-blue-500 text-blue-600 bg-blue-50/50"
                      : "border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === "basic" && (
              <DroneBasicInfoTab
                id={drone.id}
                drone_name={drone.drone_name}
                status={drone.status}
                battery_level={drone.battery_level}
                health_status={drone.health_status}
                current_x={drone.current_x}
                current_y={drone.current_y}
                description={drone.description}
                brand_name={drone.brand_name}
                weight_class={drone.weight_class}
              />
            )}

            {activeTab === "specs" && (
              <DroneSpecsTab
                max_speed={drone.max_speed}
                weight={drone.weight}
                motors={drone.motors}
                range_km={drone.range_km}
                flight_time_min={drone.flight_time_min}
                wind_resistance={drone.wind_resistance}
                payload={drone.payload}
              />
            )}

            {activeTab === "signal" && (
              <DroneSignalHealthTab
                flight_controller={drone.flight_controller}
                gps_module={drone.gps_module}
                imu_gyro={drone.imu_gyro}
                battery_mgmt={drone.battery_mgmt}
                gimbal_control={drone.gimbal_control}
                comms_link={drone.comms_link}
              />
            )}

            {activeTab === "rotors" && (
              <DroneRotorTab
                rotor_1_rpm={drone.rotor_1_rpm}
                rotor_2_rpm={drone.rotor_2_rpm}
                rotor_3_rpm={drone.rotor_3_rpm}
                rotor_4_rpm={drone.rotor_4_rpm}
              />
            )}

            {activeTab === "predictive" && (
              <DronePredictiveTab
                drone_name={drone.drone_name}
                last_maintenance={drone.last_maintenance}
                last_updated={drone.last_updated}
                battery_level={drone.battery_level}
                health_status={drone.health_status}
                flight_controller={drone.flight_controller}
                gps_module={drone.gps_module}
                data = {drone}
                
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
