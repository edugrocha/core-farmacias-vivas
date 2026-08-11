"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import type { HortoFeature } from "@/lib/api/types";

const icone = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface HortoMapProps {
  origem: { lat: number; lon: number };
  features: HortoFeature[];
}

export function HortoMap({ origem, features }: HortoMapProps) {
  return (
    <MapContainer
      center={[origem.lat, origem.lon]}
      zoom={12}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[origem.lat, origem.lon]}>
        <Popup>Sua localização</Popup>
      </Marker>
      {features.map((feature) => (
        <Marker
          key={feature.properties.id}
          position={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]}
          icon={icone}
        >
          <Popup>
            <div className="flex flex-col gap-1">
              <strong>{feature.properties.nome}</strong>
              <span>{feature.properties.instituicao_nome}</span>
              <span>
                {feature.properties.municipio}/{feature.properties.uf}
              </span>
              {feature.properties.distancia_km != null && (
                <span>{feature.properties.distancia_km} km de distância</span>
              )}
              <Link href={`/hortos#horto-${feature.properties.id}`} className="text-primary-700 underline">
                Ver detalhes
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
