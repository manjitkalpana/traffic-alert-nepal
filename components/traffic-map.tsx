"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

type TrafficOffice = {
  id: string;
  name: string;
  nameNe: string;
  district: string;
  area: string;
  phone: string;
  lat: number;
  lng: number;
  kind: string;
};

const center: LatLngExpression = [28.86, 80.36];

export default function TrafficMap({ locations }: { locations: TrafficOffice[] }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  if (!ready) return <div className="h-full min-h-[360px] animate-pulse bg-slate-100" />;

  return (
    <MapContainer center={center} zoom={9} scrollWheelZoom className="h-full min-h-[360px] rounded-2xl">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((office) => (
        <CircleMarker
          key={office.id}
          center={[office.lat, office.lng] as [number, number]}
          radius={10}
          pathOptions={{ color: "#1d4ed8", fillColor: "#2563eb", fillOpacity: 0.9, weight: 3 }}
        >
          <Popup>
            <strong>{office.name}</strong><br />
            {office.area}, {office.district}<br />
            <a href={`tel:${office.phone}`}>{office.phone}</a>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
