"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

type Report = { id: string; title: string; category: string; lat: number; lng: number; area: string };
const center: LatLngExpression = [28.98, 80.18];

export default function TrafficMap({ reports }: { reports: Report[] }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  if (!ready) return <div className="h-full min-h-[360px] animate-pulse bg-slate-100" />;
  return <MapContainer center={center} zoom={9} scrollWheelZoom className="h-full min-h-[360px] rounded-2xl">
    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    {reports.map(r => <CircleMarker key={r.id} center={[r.lat, r.lng] as [number, number]} radius={9} pathOptions={{ color: r.category === "accident" ? "#dc2626" : r.category === "closure" ? "#7c3aed" : "#d97706", fillOpacity: .8 }}>
      <Popup><strong>{r.title}</strong><br />{r.area}<br /><small>{r.category}</small></Popup>
    </CircleMarker>)}
  </MapContainer>;
}
