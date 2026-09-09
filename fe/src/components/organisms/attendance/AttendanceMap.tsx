'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

// Pin SVG untuk Kantor
const OFFICE_PIN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="38" height="46" viewBox="0 0 24 24" fill="none">
  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#0284c7" stroke="#ffffff" stroke-width="1.5"/>
  <path d="M9 8h6M9 11h6M9 14h6" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/>
</svg>`;

// Pin SVG untuk Pengguna (Hijau jika di dalam radius, Merah jika di luar radius)
const createUserPinSvg = (isInside: boolean) => `
<svg xmlns="http://www.w3.org/2000/svg" width="38" height="46" viewBox="0 0 24 24" fill="none">
  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${isInside ? '#16a34a' : '#dc2626'}" stroke="#ffffff" stroke-width="1.5"/>
  <circle cx="12" cy="9" r="3.5" fill="#ffffff"/>
</svg>`;

const officePinIcon = L.divIcon({
  className: '',
  html: OFFICE_PIN_SVG,
  iconSize: [38, 46],
  iconAnchor: [19, 44],
  popupAnchor: [0, -40],
});

export interface AttendanceMapProps {
  officeLatitude: number;
  officeLongitude: number;
  officeRadiusMeter: number;
  officeName?: string;
  userLatitude?: number | null;
  userLongitude?: number | null;
  userAccuracyMeter?: number | null;
  isInsideGeofence?: boolean;
  distanceMeter?: number | null;
}

/** Mengatur zoom & bounds peta agar kedua titik terlihat nyaman */
function MapBoundsUpdater({
  officePos,
  userPos,
}: {
  officePos: [number, number];
  userPos?: [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (userPos) {
      const bounds = L.latLngBounds([officePos, userPos]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else {
      map.setView(officePos, 15);
    }
  }, [map, officePos, userPos]);

  return null;
}

export function AttendanceMap({
  officeLatitude,
  officeLongitude,
  officeRadiusMeter,
  officeName = 'Kantor Penempatan',
  userLatitude,
  userLongitude,
  userAccuracyMeter,
  isInsideGeofence = false,
  distanceMeter,
}: AttendanceMapProps) {
  const officePos = useMemo<[number, number]>(
    () => [officeLatitude, officeLongitude],
    [officeLatitude, officeLongitude],
  );

  const userPos = useMemo<[number, number] | null>(() => {
    if (userLatitude == null || userLongitude == null) return null;
    return [userLatitude, userLongitude];
  }, [userLatitude, userLongitude]);

  const userPinIcon = useMemo(() => {
    return L.divIcon({
      className: '',
      html: createUserPinSvg(isInsideGeofence),
      iconSize: [38, 46],
      iconAnchor: [19, 44],
      popupAnchor: [0, -40],
    });
  }, [isInsideGeofence]);

  return (
    <div className="relative z-0 h-64 w-full overflow-hidden rounded-xl border border-border shadow-xs sm:h-72">
      <MapContainer center={officePos} zoom={15} className="z-0 h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsUpdater officePos={officePos} userPos={userPos} />

        {/* Marker Kantor */}
        <Marker position={officePos} icon={officePinIcon}>
          <Popup>
            <div className="text-xs">
              <strong className="block text-sm text-foreground">{officeName}</strong>
              <span className="text-muted-foreground">
                Radius Absensi: {officeRadiusMeter} meter
              </span>
            </div>
          </Popup>
        </Marker>

        {/* Lingkaran Radius Geofence */}
        <Circle
          center={officePos}
          radius={Math.max(1, officeRadiusMeter)}
          pathOptions={{
            color: isInsideGeofence ? '#16a34a' : '#0284c7',
            fillColor: isInsideGeofence ? '#22c55e' : '#0284c7',
            fillOpacity: 0.15,
            weight: 2,
          }}
        />

        {/* Marker & Akurasi Pengguna */}
        {userPos ? (
          <>
            <Marker position={userPos} icon={userPinIcon}>
              <Popup>
                <div className="text-xs">
                  <strong className="block text-sm text-foreground">Lokasi Anda</strong>
                  <span>Status: {isInsideGeofence ? 'Dalam Area ✅' : 'Di Luar Area ❌'}</span>
                  {distanceMeter != null ? (
                    <div className="text-muted-foreground">Jarak: {distanceMeter} m</div>
                  ) : null}
                  {userAccuracyMeter != null ? (
                    <div className="text-muted-foreground">
                      Akurasi: ±{Math.round(userAccuracyMeter)} m
                    </div>
                  ) : null}
                </div>
              </Popup>
            </Marker>

            {userAccuracyMeter ? (
              <Circle
                center={userPos}
                radius={Math.max(1, userAccuracyMeter)}
                pathOptions={{
                  color: isInsideGeofence ? '#16a34a' : '#dc2626',
                  fillColor: isInsideGeofence ? '#16a34a' : '#dc2626',
                  fillOpacity: 0.08,
                  weight: 1,
                  dashArray: '3, 4',
                }}
              />
            ) : null}
          </>
        ) : null}
      </MapContainer>
    </div>
  );
}
