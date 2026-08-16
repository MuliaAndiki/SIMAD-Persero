"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMemo } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  TileLayer,
  useMapEvents,
} from "react-leaflet";

/**
 * Pin SVG kustom (divIcon) — menghindari masalah asset ikon default Leaflet
 * (leaflet/dist/images/marker-icon.png tidak selalu tersedia saat di-bundle).
 */
const PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"/><circle cx="12" cy="9" r="3" fill="#ffffff"/></svg>`;

const pinIcon = L.divIcon({
  className: "",
  html: PIN_SVG,
  iconSize: [36, 44],
  iconAnchor: [18, 42],
});

// Titik awal peta (Jakarta) jika koordinat belum dipilih.
const DEFAULT_CENTER: [number, number] = [-6.2088, 106.8456];
const DEFAULT_ZOOM = 13;

export interface OfficeMapPickerProps {
  /** Koordinat saat ini dari form (null = belum dipilih). */
  latitude: number | null;
  longitude: number | null;
  /** Radius geofence (meter) untuk menggambar lingkaran. */
  radiusMeter: number;
  /** Dipanggil saat user mengklik peta — latitude & longitude langsung terisi. */
  onPick: (latitude: number, longitude: number) => void;
}

/** Menangkap klik pada peta lalu melaporkan koordinat ke parent. */
function MapClickHandler({ onPick }: Pick<OfficeMapPickerProps, "onPick">) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

/**
 * OfficeMapPicker — peta Leaflet interaktif untuk memilih titik koordinat
 * kantor. User cukup mengklik peta; latitude & longitude langsung terisi.
 *
 * Catatan: komponen ini di-import via `next/dynamic` dengan `ssr: false`
 * (Leaflet membutuhkan browser API), lihat OfficeFormDialog.
 */
export function OfficeMapPicker({
  latitude,
  longitude,
  radiusMeter,
  onPick,
}: OfficeMapPickerProps) {
  const position = useMemo<[number, number] | null>(() => {
    if (latitude == null || longitude == null) return null;
    return [latitude, longitude];
  }, [latitude, longitude]);

  return (
    <div className="relative z-0 overflow-hidden rounded-lg border">
      <MapContainer
        center={position ?? DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="z-0 h-72 w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onPick={onPick} />
        {position ? (
          <>
            <Marker position={position} icon={pinIcon} />
            <Circle
              center={position}
              radius={Math.max(1, radiusMeter)}
              pathOptions={{
                color: "#ef4444",
                fillColor: "#ef4444",
                fillOpacity: 0.12,
              }}
            />
          </>
        ) : null}
      </MapContainer>
    </div>
  );
}
