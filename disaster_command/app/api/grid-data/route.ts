import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function GET() {
  try {
    const [dronesRes, entitiesRes] = await Promise.all([
      fetch(`${API_BASE}/api/drones/detailed_fleet`, { cache: "no-store" }),
      fetch(`${API_BASE}/api/entities`, { cache: "no-store" }),
    ]);

    if (!dronesRes.ok || !entitiesRes.ok) {
      return NextResponse.json({ error: "Failed to fetch grid data" }, { status: 502 });
    }

    const [dronesData, entitiesData] = await Promise.all([
      dronesRes.json(),
      entitiesRes.json(),
    ]);

    return NextResponse.json({
      drones: dronesData.drones ?? [],
      entities: entitiesData.entities ?? [],
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
