'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import type { AttendanceOfficeInfo, AttendanceSettingInfo } from '@/types/api/attendance.types';
import { checkInsideGeofence, validateAttendanceTime } from '@/utils/geofence';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  Loader2,
  LogIn,
  LogOut,
  MapPin,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';

/** Peta Leaflet di-load secara dinamis dengan SSR nonaktif */
const AttendanceMap = dynamic(() => import('./AttendanceMap').then((mod) => mod.AttendanceMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-full flex-col items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground sm:h-72">
      <Loader2 className="size-6 animate-spin text-primary" />
      <span>Memuat peta interaktif…</span>
    </div>
  ),
});

export interface AttendanceLocationDialogProps {
  open: boolean;
  type: 'CHECK_IN' | 'CHECK_OUT';
  office: AttendanceOfficeInfo | null;
  setting?: AttendanceSettingInfo | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  }) => Promise<void> | void;
}

interface CoordsState {
  latitude: number;
  longitude: number;
  accuracy: number;
}

function getGeolocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      reject(new Error('Perangkat atau browser tidak mendukung fitur geolokasi.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (err) => {
        const messages: Record<number, string> = {
          1: 'Izin akses lokasi (GPS) ditolak. Harap izinkan akses lokasi pada browser/perangkat.',
          2: 'Posisi GPS tidak tersedia. Pastikan sinyal GPS aktif.',
          3: 'Waktu permintaan lokasi habis (timeout). Silakan klik tombol perbarui lokasi.',
        };
        reject(new Error(messages[err.code] ?? err.message));
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      },
    );
  });
}

export function AttendanceLocationDialog({
  open,
  type,
  office,
  setting,
  isSubmitting,
  onClose,
  onSubmit,
}: AttendanceLocationDialogProps) {
  const [coords, setCoords] = useState<CoordsState | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  // Update jam realtime setiap detik saat modal terbuka
  useEffect(() => {
    if (!open) return;
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [open]);

  // Ambil lokasi saat modal dibuka
  const fetchLocation = useCallback(async () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    try {
      const pos = await getGeolocation();
      setCoords({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      });
    } catch (err) {
      setLocationError(err instanceof Error ? err.message : 'Gagal mendeteksi lokasi');
    } finally {
      setIsLoadingLocation(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchLocation();
    } else {
      setCoords(null);
      setLocationError(null);
    }
  }, [open, fetchLocation]);

  // Validasi Jam Kerja
  const timeValidation = useMemo(() => {
    return validateAttendanceTime(type, setting, currentTime);
  }, [type, setting, currentTime]);

  // Validasi Geofence & Radius
  const hasOfficeCoords =
    office != null &&
    office.latitude != null &&
    office.longitude != null &&
    !Number.isNaN(Number(office.latitude)) &&
    !Number.isNaN(Number(office.longitude));

  const officeLat = hasOfficeCoords ? Number(office.latitude) : 0;
  const officeLon = hasOfficeCoords ? Number(office.longitude) : 0;
  const officeRadius = office?.radiusMeter ?? 100;

  const geofenceResult = useMemo(() => {
    if (!coords || !hasOfficeCoords) {
      return { distance: null, inside: false };
    }
    return checkInsideGeofence(
      coords.latitude,
      coords.longitude,
      officeLat,
      officeLon,
      officeRadius,
    );
  }, [coords, hasOfficeCoords, officeLat, officeLon, officeRadius]);

  const isInside = geofenceResult.inside;
  const distance = geofenceResult.distance;

  // Syarat dapat submit absensi
  const canSubmit =
    !isLoadingLocation &&
    !isSubmitting &&
    coords !== null &&
    hasOfficeCoords &&
    isInside &&
    timeValidation.allowed;

  const handleSubmit = async () => {
    if (!canSubmit || !coords) return;
    await onSubmit(coords);
  };

  const isCheckIn = type === 'CHECK_IN';

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 pr-6">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              {isCheckIn ? (
                <LogIn className="size-5 text-emerald-600" />
              ) : (
                <LogOut className="size-5 text-sky-600" />
              )}
              {isCheckIn ? 'Presensi Masuk (Check-in)' : 'Presensi Pulang (Check-out)'}
            </DialogTitle>
            <Badge variant={timeValidation.allowed ? 'default' : 'destructive'}>
              {timeValidation.currentWib}
            </Badge>
          </div>
          <DialogDescription>
            Sistem memverifikasi posisi koordinat GPS dan batas waktu absensi di lokasi kantor
            penempatan.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Status Jadwal Waktu */}
          <div
            className={`flex items-start gap-3 rounded-xl border p-3.5 text-xs sm:text-sm ${
              timeValidation.allowed
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200'
                : 'border-destructive/40 bg-destructive/10 text-destructive'
            }`}
          >
            <Clock className="mt-0.5 size-4 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold">
                {isCheckIn
                  ? 'Jadwal Check-in: 08:00 - 10:00 WIB'
                  : 'Jadwal Check-out: 17:00 - 20:00 WIB'}
              </span>
              <span>{timeValidation.message}</span>
            </div>
          </div>

          {/* Info Kantor Penempatan */}
          {office ? (
            <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-3 text-xs sm:text-sm">
              <Building2 className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-foreground">{office.name}</span>
                {office.address ? (
                  <span className="text-muted-foreground">{office.address}</span>
                ) : null}
                <span className="text-xs text-primary font-medium">
                  Radius Geofence: {officeRadius} meter
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              <ShieldAlert className="size-4 shrink-0" />
              <span>
                Lokasi kantor penempatan belum ditentukan atau belum dikonfigurasi oleh HR.
              </span>
            </div>
          )}

          {/* Peta Interaktif Leaflet */}
          {hasOfficeCoords ? (
            <div className="flex flex-col gap-1.5">
              <span className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Peta Area Penempatan & Posisi Anda</span>
                {coords ? (
                  <span className="text-[11px] text-muted-foreground">
                    Akurasi GPS: ±{Math.round(coords.accuracy)}m
                  </span>
                ) : null}
              </span>
              <AttendanceMap
                officeLatitude={officeLat}
                officeLongitude={officeLon}
                officeRadiusMeter={officeRadius}
                officeName={office?.name}
                userLatitude={coords?.latitude}
                userLongitude={coords?.longitude}
                userAccuracyMeter={coords?.accuracy}
                isInsideGeofence={isInside}
                distanceMeter={distance}
              />
            </div>
          ) : null}

          {/* Kotak Status Deteksi Lokasi GPS */}
          <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground sm:text-sm">
                <Compass className="size-4 text-primary" />
                Data Koordinat GPS
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fetchLocation}
                disabled={isLoadingLocation || isSubmitting}
                className="h-7 text-xs"
              >
                <RefreshCw className={`size-3 ${isLoadingLocation ? 'animate-spin' : ''}`} />
                {isLoadingLocation ? 'Mencari GPS…' : 'Perbarui GPS'}
              </Button>
            </div>

            <div className="mt-2.5 flex flex-col gap-2 text-xs">
              {isLoadingLocation ? (
                <div className="flex items-center gap-2 py-3 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  <span>Mendeteksi koordinat GPS presisi tinggi dari perangkat Anda…</span>
                </div>
              ) : locationError ? (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-destructive">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">Gagal Mengambil Lokasi</span>
                    <span>{locationError}</span>
                  </div>
                </div>
              ) : coords ? (
                <>
                  <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                    <div className="rounded-lg bg-muted/40 p-2">
                      <span className="block text-[10px] uppercase text-muted-foreground font-medium">
                        Latitude
                      </span>
                      <span className="font-mono font-medium text-foreground">
                        {coords.latitude.toFixed(6)}
                      </span>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-2">
                      <span className="block text-[10px] uppercase text-muted-foreground font-medium">
                        Longitude
                      </span>
                      <span className="font-mono font-medium text-foreground">
                        {coords.longitude.toFixed(6)}
                      </span>
                    </div>
                    <div className="col-span-2 rounded-lg bg-muted/40 p-2 sm:col-span-1">
                      <span className="block text-[10px] uppercase text-muted-foreground font-medium">
                        Jarak ke Kantor
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        {distance != null ? `${distance} m` : '-'}
                      </span>
                    </div>
                  </div>

                  {/* Indikator Validitas Radius */}
                  <div
                    className={`mt-1 flex items-start gap-2 rounded-lg border p-2.5 text-xs ${
                      isInside
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200'
                        : 'border-destructive/40 bg-destructive/10 text-destructive'
                    }`}
                  >
                    {isInside ? (
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <ShieldAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
                    )}
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold">
                        {isInside
                          ? 'Lokasi Valid (Di Dalam Radius Kantor)'
                          : 'Di Luar Radius Kantor'}
                      </span>
                      <span>
                        {isInside
                          ? `Jarak Anda ${distance}m dari pusat kantor (maksimal ${officeRadius}m).`
                          : `Jarak Anda ${distance}m dari kantor melebihi batas radius ${officeRadius}m. Anda tidak dapat melakukan absensi di luar area kantor.`}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-4" />
                  <span>Tekan tombol "Perbarui GPS" untuk mendeteksi posisi Anda.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2 flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            type="button"
            variant={isInside && timeValidation.allowed ? 'default' : 'secondary'}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Memproses…
              </>
            ) : isCheckIn ? (
              <>
                <LogIn className="size-4" />
                Konfirmasi Check-in
              </>
            ) : (
              <>
                <LogOut className="size-4" />
                Konfirmasi Check-out
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
