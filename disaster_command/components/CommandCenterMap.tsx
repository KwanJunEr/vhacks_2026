"use client";

import OpenStreetMapView from "@/components/OpenStreetMapView";

export default function CommandCenterMap() {
  return (
    <OpenStreetMapView
      label="Live Global Feed"
      showResourcesLink
      resourcesHref="/dashboard/resources"
    />
  );
}
