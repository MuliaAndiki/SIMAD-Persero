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

  // Eksekusi pencarian geocoding (API internal /api/geocode + Photon fallback)
  const performSearch = useCallback(
    async (queryText: string) => {
      const trimmed = queryText.trim();
      if (!trimmed || trimmed.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      // 1. Cek format koordinat langsung (contoh: "-5.3812, 105.2567")
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

      setIsSearching(true);
      setShowResults(true);

      // 2. Query ke API internal /api/geocode (terbebas dari isu CORS & adblocker)
      try {
        let apiUrl = `/api/geocode?q=${encodeURIComponent(trimmed)}`;
        if (hasCoordinates) {
          apiUrl += `&lat=${latitude}&lon=${longitude}`;
        }

        const res = await fetch(apiUrl);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.results) && data.results.length > 0) {
            setSearchResults(data.results);
            return;
          }
        }
      } catch (err) {
        console.warn('Internal geocode route failed, trying direct fallback:', err);
      }

      // 3. Direct client fallback ke Photon API (tanpa parameter lang=id yang dilarang)
      try {
        let fallbackUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=6`;
        if (hasCoordinates) {
          fallbackUrl += `&lat=${latitude}&lon=${longitude}`;
        }

        const res = await fetch(fallbackUrl);
        if (res.ok) {
          const data = await res.json();
          const results: LocationSearchResult[] = (data.features || []).map(
            (f: any, idx: number) => {
              const p = f.properties || {};
              const [lngVal, latVal] = f.geometry?.coordinates || [0, 0];
              const primaryName = p.name || p.street || p.city || 'Lokasi';
              const addressParts = [p.street, p.district, p.city, p.state, p.country]
                .filter(Boolean)
                .filter((part) => part !== primaryName);

              return {
                id: `direct-${p.osm_id || idx}-${latVal}-${lngVal}`,
                name: primaryName,
                address: addressParts.join(', ') || p.country || '',
                lat: Number(Number(latVal).toFixed(6)),
                lng: Number(Number(lngVal).toFixed(6)),
                isCoord: false,
              };
            },
          );

          setSearchResults(results);
          return;
        }
      } catch (err) {
        console.error('All geocoding attempts failed:', err);
      }

      setSearchResults([]);
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
      setShowResults(true); // Buka dropdown langsung menampilkan status loading
      debounceTimerRef.current = setTimeout(async () => {
        try {
          await performSearch(val);
        } finally {
          setIsSearching(false);
        }
      }, 350);
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
    setIsSearching(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (searchResults.length > 0) {
        handleSelectResult(searchResults[0]);
      } else if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        setShowResults(true);
        performSearch(searchQuery).finally(() => setIsSearching(false));
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
          className="absolute top-2.5 left-2.5 right-2.5 sm:right-auto sm:w-84 md:w-96 z-[500]"
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
                if (searchQuery.trim().length >= 2) {
                  setShowResults(true);
                  if (searchResults.length === 0 && !isSearching) {
                    setIsSearching(true);
                    performSearch(searchQuery).finally(() => setIsSearching(false));
                  }
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Cari lokasi, jalan, kota, atau koordinat..."
              className="w-full h-9 pl-9 pr-20 rounded-lg border border-border/80 bg-background/95 text-xs text-foreground shadow-md backdrop-blur-md transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />

            <div className="absolute right-2 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Hapus pencarian"
                >
                  <X className="size-3.5" />
                </button>
              )}

              {searchQuery.trim().length >= 2 && (
                <button
                  type="button"
                  onClick={() => {
                    if (debounceTimerRef.current) {
                      clearTimeout(debounceTimerRef.current);
                    }
                    setIsSearching(true);
                    setShowResults(true);
                    performSearch(searchQuery).finally(() => setIsSearching(false));
                  }}
                  disabled={isSearching}
                  className="h-6 px-2 text-[10px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 rounded-md transition-colors flex items-center gap-1 shrink-0"
                >
                  {isSearching ? <Loader2 className="size-3 animate-spin" /> : 'Cari'}
                </button>
              )}
            </div>
          </div>

          {/* ─── Dropdown Hasil Pencarian & State Loading ─── */}
          {showResults && (
            <div className="mt-1.5 max-h-64 overflow-y-auto rounded-lg border border-border/80 bg-background/95 shadow-lg backdrop-blur-md py-1 divide-y divide-border/40 animate-in fade-in-0 zoom-in-95 duration-100">
              {/* State 1: Sedang Mencari (Loader Aktif) */}
              {isSearching ? (
                <div className="p-3.5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-primary shrink-0" />
                  <span className="font-medium text-foreground">Mencari lokasi...</span>
                </div>
              ) : searchResults.length > 0 ? (
                /* State 2: Hasil Pencarian Ditemukan */
                searchResults.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => handleSelectResult(item)}
                    className="w-full px-3 py-2.5 text-left hover:bg-accent/60 transition-colors flex items-start gap-2.5 group cursor-pointer"
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
              ) : searchQuery.trim().length >= 2 ? (
                /* State 3: Tidak Ditemukan */
                <div className="p-4 text-center text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Lokasi tidak ditemukan</p>
                  <p className="text-[11px]">
                    Coba gunakan nama kota, nama jalan, atau masukkan koordinat (contoh: <code className="bg-muted px-1 py-0.5 rounded text-foreground">-5.3812, 105.2567</code>).
                  </p>
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
              ? 'Klik peta atau geser pin untuk mengubah titik kantor'
              : 'Cari lokasi di atas atau klik peta untuk menetapkan koordinat'}
          </span>
        </div>
      )}
    </div>
  );
}

export default OfficeLocationMap;
