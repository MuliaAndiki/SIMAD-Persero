'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, MapPin, Navigation, Search, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
  ZoomControl,
} from 'react-leaflet';

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
  showSearch?: boolean;
}

interface LocationSearchResult {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  isCoord?: boolean;
}

// Default center: Kantor PLN UID Lampung
const DEFAULT_CENTER: [number, number] = [-5.381234, 105.256789];

function parseCoordinateString(input: string): [number, number] | null {
  const clean = input.replace(/^@/, '').trim();
  const match = clean.match(/^(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const lat = parseFloat(match[1]);
  const lng = parseFloat(match[2]);
  if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
    return [Number(lat.toFixed(6)), Number(lng.toFixed(6))];
  }
  return null;
}

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

function MapCenterController({
  position,
  flyTarget,
}: {
  position: [number, number];
  flyTarget: [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (flyTarget) {
      map.flyTo(flyTarget, Math.max(map.getZoom(), 16), {
        animate: true,
        duration: 1.2,
      });
    } else {
      map.setView(position, map.getZoom() < 13 ? 15 : map.getZoom(), {
        animate: true,
      });
    }
  }, [map, position, flyTarget]);

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
  showSearch = true,
}: OfficeLocationMapProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);

  const searchBoxRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Eksekusi pencarian ke Photon Geocoder API & Parser Koordinat
  const performSearch = useCallback(
    async (queryText: string) => {
      const trimmed = queryText.trim();
      if (!trimmed || trimmed.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      // 1. Cek format koordinat langsung (contoh: -5.3812, 105.2567)
      const coord = parseCoordinateString(trimmed);
      if (coord) {
        setSearchResults([
          {
            id: `coord-${coord[0]}-${coord[1]}`,
            name: `Titik Koordinat: ${coord[0]}, ${coord[1]}`,
            address: 'Format koordinat Latitude, Longitude terdeteksi',
            lat: coord[0],
            lng: coord[1],
            isCoord: true,
          },
        ]);
        setIsSearching(false);
        setShowResults(true);
        return;
      }

      // 2. Query Photon API (OpenStreetMap Geocoder dengan CORS terbuka)
      try {
        setIsSearching(true);
        let url = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=5&lang=id`;
        if (hasCoordinates) {
          url += `&lat=${latitude}&lon=${longitude}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();

        const results: LocationSearchResult[] = (data.features || []).map(
          (f: any, idx: number) => {
            const p = f.properties || {};
            const [lng, lat] = f.geometry?.coordinates || [0, 0];
            const primaryName = p.name || p.street || p.city || 'Lokasi';
            const addressParts = [p.street, p.district, p.city, p.state, p.country]
              .filter(Boolean)
              .filter((part) => part !== primaryName);

            return {
              id: `${p.osm_id || idx}-${lat}-${lng}`,
              name: primaryName,
              address: addressParts.join(', ') || p.country || '',
              lat: Number(Number(lat).toFixed(6)),
              lng: Number(Number(lng).toFixed(6)),
              isCoord: false,
            };
          },
        );

        setSearchResults(results);
        setShowResults(true);
      } catch (err) {
        console.error('Error fetching location suggestions:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [hasCoordinates, latitude, longitude],
  );

  // Debounced search saat pengguna mengetik
  const handleQueryChange = (val: string) => {
    setSearchQuery(val);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (val.trim().length >= 2) {
      setIsSearching(true);
      debounceTimerRef.current = setTimeout(() => {
        performSearch(val);
      }, 400);
    } else {
      setSearchResults([]);
      setShowResults(false);
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result: LocationSearchResult) => {
    setFlyTarget([result.lat, result.lng]);
    if (onLocationSelect) {
      onLocationSelect(result.lat, result.lng);
    }
    setSearchQuery(result.name);
    setShowResults(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (searchResults.length > 0) {
        handleSelectResult(searchResults[0]);
      } else {
        performSearch(searchQuery);
      }
    } else if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  // Tutup dropdown saat klik di luar kotak pencarian
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Mencegah Leaflet menangkap event scroll/klik pada search container
  useEffect(() => {
    const el = searchBoxRef.current;
    if (el) {
      L.DomEvent.disableClickPropagation(el);
      L.DomEvent.disableScrollPropagation(el);
    }
  }, []);

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
      {/* ─── Search Field Overlay (Top Overlay dengan Z-Index Tinggi) ─── */}
      {showSearch && (
        <div
          ref={searchBoxRef}
          className="absolute top-2.5 left-2.5 right-2.5 sm:right-auto sm:w-80 md:w-96 z-[500]"
        >
          <div className="relative flex items-center">
            <div className="absolute left-3 flex items-center pointer-events-none text-muted-foreground">
              {isSearching ? (
                <Loader2 className="size-4 animate-spin text-primary" />
              ) : (
                <Search className="size-4" />
              )}
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0 || searchQuery.trim().length >= 2) {
                  setShowResults(true);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Cari lokasi, jalan, kota, atau koordinat..."
              className="w-full h-9 pl-9 pr-8 rounded-lg border border-border/80 bg-background/95 text-xs text-foreground shadow-md backdrop-blur-md transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Hapus pencarian"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Dropdown Hasil Pencarian */}
          {showResults && (
            <div className="mt-1.5 max-h-60 overflow-y-auto rounded-lg border border-border/80 bg-background/95 shadow-lg backdrop-blur-md py-1 divide-y divide-border/40 animate-in fade-in-0 zoom-in-95 duration-100">
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => handleSelectResult(item)}
                    className="w-full px-3 py-2 text-left hover:bg-accent/60 transition-colors flex items-start gap-2.5 group"
                  >
                    <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {item.isCoord ? (
                        <Navigation className="size-3.5" />
                      ) : (
                        <MapPin className="size-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate flex items-center justify-between">
                        <span className="truncate">{item.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono font-normal ml-2 shrink-0">
                          {item.lat}, {item.lng}
                        </span>
                      </div>
                      {item.address && (
                        <div className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                          {item.address}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              ) : !isSearching && searchQuery.trim().length >= 2 ? (
                <div className="p-3 text-center text-xs text-muted-foreground">
                  Lokasi tidak ditemukan. Coba gunakan nama kota, nama jalan, atau masukkan koordinat (contoh: <code>-5.3812, 105.2567</code>).
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* ─── Leaflet Map Container ─── */}
      <MapContainer
        center={centerPos}
        zoom={hasCoordinates ? 16 : 13}
        zoomControl={false}
        className="z-0 h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Letakkan tombol Zoom di kanan bawah agar tidak bertabrakan dengan Search Bar */}
        <ZoomControl position="bottomright" />

        <MapCenterController position={centerPos} flyTarget={flyTarget} />

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

      {/* ─── Helper Badge (Bottom Left Overlay) ─── */}
      {isInteractive && (
        <div className="absolute bottom-2.5 left-2.5 z-[400] max-w-[85%] rounded-lg bg-background/90 px-3 py-1.5 text-xs text-foreground shadow-md backdrop-blur-xs border flex items-center gap-2">
          <MapPin className="size-3.5 text-primary shrink-0" />
          <span className="truncate">
            {hasCoordinates
              ? '💡 Geser pin atau klik peta untuk mengubah titik kantor'
              : '🔍 Cari lokasi di atas atau klik peta untuk menetapkan koordinat'}
          </span>
        </div>
      )}
    </div>
  );
}

export default OfficeLocationMap;
