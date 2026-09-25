'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocateFixed, MapPin } from 'lucide-react';
import React, { useEffect, useMemo } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';

// Pin SVG Khusus Kantor PLN
const OFFICE_PIN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="38" height="46" viewBox="0 0 24 24" fill="none">
  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#0284c7" stroke="#ffffff" stroke-width="1.5"/>
  <path d="M9 8h6M9 11h6M9 14h6" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/>
</svg>`;

const officePinIcon = L.divIcon({
  className: '',
  html: OFFICE_PIN_SVG,
  iconSize: [38, 46],
  iconAnchor: [19, 44],
  popupAnchor: [0, -40],
});

export interface OfficeLocationMapProps {
  latitude: number | null;
  longitude: number | null;
  radiusMeter?: number;
  officeName?: string;
  isInteractive?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  heightClassName?: string;
}

// Default center: Kantor PLN UID Lampung
const DEFAULT_CENTER: [number, number] = [-5.381234, 105.256789];

function MapClickHandler({
  onLocationSelect,
  isInteractive,
}: {
  onLocationSelect?: (lat: number, lng: number) => void;
  isInteractive?: boolean;
}) {
  useMapEvents({
    click(e) {
      if (isInteractive && onLocationSelect) {
        onLocationSelect(
          Number(e.latlng.lat.toFixed(6)),
          Number(e.latlng.lng.toFixed(6)),
        );
      }
    },
  });
  return null;
}

function MapCenterController({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, map.getZoom() < 13 ? 15 : map.getZoom(), {
      animate: true,
    });
  }, [map, position]);

  return null;
}

export function OfficeLocationMap({
  latitude,
  longitude,
  radiusMeter = 100,
  officeName = 'Lokasi Kantor',
  isInteractive = false,
  onLocationSelect,
  heightClassName = 'h-72 sm:h-80',
}: OfficeLocationMapProps) {
  const hasCoordinates =
    latitude != null &&
    longitude != null &&
    !Number.isNaN(latitude) &&
    !Number.isNaN(longitude);

  const centerPos = useMemo<[number, number]>(() => {
    if (hasCoordinates) {
      return [latitude as number, longitude as number];
    }
    return DEFAULT_CENTER;
  }, [hasCoordinates, latitude, longitude]);

  const markerEventHandlers = useMemo(
    () => ({
      dragend(e: any) {
        if (!isInteractive || !onLocationSelect) return;
        const marker = e.target;
        if (marker != null) {
          const latLng = marker.getLatLng();
          onLocationSelect(
            Number(latLng.lat.toFixed(6)),
            Number(latLng.lng.toFixed(6)),
          );
        }
      },
    }),
    [isInteractive, onLocationSelect],
  );

  return (
    <div className={`relative z-0 w-full overflow-hidden rounded-xl border border-border bg-muted/20 shadow-xs ${heightClassName}`}>
      <MapContainer
        center={centerPos}
        zoom={hasCoordinates ? 16 : 13}
        className="z-0 h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapCenterController position={centerPos} />

        <MapClickHandler
          onLocationSelect={onLocationSelect}
          isInteractive={isInteractive}
        />

        {hasCoordinates && (
          <>
            <Marker
              position={centerPos}
              icon={officePinIcon}
              draggable={isInteractive}
              eventHandlers={markerEventHandlers}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <strong className="block text-sm text-foreground">{officeName}</strong>
                  <p className="text-muted-foreground font-mono">
                    Lat: {latitude?.toFixed(6)}, Lng: {longitude?.toFixed(6)}
                  </p>
                  <p className="text-primary font-medium">
                    Radius Geofence: {radiusMeter} meter
                  </p>
                  {isInteractive && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 italic pt-1 border-t">
                      * Geser pin ini atau klik peta untuk memindahkan titik kantor
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>

            <Circle
              center={centerPos}
              radius={Math.max(5, radiusMeter)}
              pathOptions={{
                color: '#0284c7',
                fillColor: '#0284c7',
                fillOpacity: 0.18,
                weight: 2,
              }}
            />
          </>
        )}
      </MapContainer>

      {/* Helper overlay for interactive mode */}
      {isInteractive && (
        <div className="absolute top-2 left-2 z-[400] max-w-[85%] rounded-lg bg-background/90 px-3 py-1.5 text-xs text-foreground shadow-md backdrop-blur-xs border flex items-center gap-2">
          <MapPin className="size-3.5 text-primary shrink-0" />
          <span className="truncate">
            {hasCoordinates
              ? '💡 Klik peta atau geser pin untuk mengubah titik lokasi kantor'
              : '📍 Klik pada peta untuk menetapkan koordinat kantor PLN'}
          </span>
        </div>
      )}
    </div>
  );
}

export default OfficeLocationMap;
