'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Switch } from '@/components/atoms/switch';
import { Textarea } from '@/components/atoms/textarea';
import type { DepartmentResponse } from '@/types/api/department.types';
import type { AttendanceSettingInput, OfficeResponse } from '@/types/api/office.types';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Info,
  Loader2,
  LocateFixed,
  MapPin,
  Save,
  ShieldAlert,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import React, { useState } from 'react';
import { toast } from 'sonner';

/** Peta interaktif Leaflet di-load secara dinamis dengan SSR dinonaktifkan */
const OfficeLocationMap = dynamic(
  () => import('./OfficeLocationMap').then((mod) => mod.OfficeLocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-72 sm:h-80 w-full flex-col items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span>Memuat peta interaktif…</span>
      </div>
    ),
  },
);

export interface OfficeFormValues {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  radiusMeter: string;
  departmentIds: string[];
  attendanceSetting: {
    checkInStart: string;
    checkInEnd: string;
    checkOutStart: string;
    checkOutEnd: string;
    lateAfter: string;
    allowWeekend: boolean;
  };
}

interface OfficeFormCardProps {
  initialData?: OfficeResponse | null;
  departments: DepartmentResponse[];
  isSaving: boolean;
  onSave: (values: OfficeFormValues) => Promise<void>;
}

export function OfficeFormCard({
  initialData,
  departments,
  isSaving,
  onSave,
}: OfficeFormCardProps) {
  const isEdit = Boolean(initialData);

  const [form, setForm] = useState<OfficeFormValues>({
    name: initialData?.name ?? '',
    address: initialData?.address ?? '',
    latitude: initialData?.latitude != null ? String(initialData.latitude) : '',
    longitude: initialData?.longitude != null ? String(initialData.longitude) : '',
    radiusMeter: initialData?.radiusMeter != null ? String(initialData.radiusMeter) : '100',
    departmentIds: initialData?.departments ? initialData.departments.map((d) => d.id) : [],
    attendanceSetting: {
      checkInStart: initialData?.attendanceSetting?.checkInStart ?? '06:00',
      checkInEnd: initialData?.attendanceSetting?.checkInEnd ?? '10:00',
      checkOutStart: initialData?.attendanceSetting?.checkOutStart ?? '16:00',
      checkOutEnd: initialData?.attendanceSetting?.checkOutEnd ?? '20:00',
      lateAfter: initialData?.attendanceSetting?.lateAfter ?? '08:00',
      allowWeekend: initialData?.attendanceSetting?.allowWeekend ?? false,
    },
  });

  const [isGettingGps, setIsGettingGps] = useState(false);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation tidak didukung oleh browser Anda');
      return;
    }

    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: String(pos.coords.latitude.toFixed(6)),
          longitude: String(pos.coords.longitude.toFixed(6)),
        }));
        setIsGettingGps(false);
        toast.success('Koordinat GPS berhasil diambil dari lokasi saat ini');
      },
      (err) => {
        setIsGettingGps(false);
        toast.error(`Gagal mengambil koordinat: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleLocationPicked = (lat: number, lng: number) => {
    setForm((prev) => ({
      ...prev,
      latitude: String(lat),
      longitude: String(lng),
    }));
  };

  const handleToggleDepartment = (deptId: string) => {
    setForm((prev) => ({
      ...prev,
      departmentIds: prev.departmentIds.includes(deptId)
        ? prev.departmentIds.filter((id) => id !== deptId)
        : [...prev.departmentIds, deptId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Nama kantor wajib diisi');
      return;
    }
    if (!form.latitude || !form.longitude) {
      toast.error('Koordinat latitude dan longitude wajib diisi. Silakan klik pada peta.');
      return;
    }
    await onSave(form);
  };

  const parsedLat = form.latitude ? parseFloat(form.latitude) : null;
  const parsedLng = form.longitude ? parseFloat(form.longitude) : null;
  const parsedRadius = form.radiusMeter ? parseFloat(form.radiusMeter) : 100;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/hr_admin/offices" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="size-3.5" />
              Daftar Kantor
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">
              {isEdit ? `Edit: ${initialData?.name}` : 'Tambah Kantor Baru'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEdit ? 'Ubah Informasi & Pengaturan Kantor' : 'Tambah Lokasi Kantor PLN Baru'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Konfigurasikan detail lokasi, geofence pada peta, departemen yang dinaungi, dan jadwal waktu absensi kantor.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" asChild disabled={isSaving}>
            <Link href="/hr_admin/offices">Batal</Link>
          </Button>
          <Button type="submit" disabled={isSaving} className="gap-2">
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {isSaving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Kantor'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Office info & Geolocation */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Card 1: Informasi Kantor & Lokasi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="size-5 text-primary" />
                Informasi Kantor & Titik Geofencing
              </CardTitle>
              <CardDescription>
                Tentukan lokasi kantor pada peta dan sesuaikan radius toleransi jarak presensi peserta magang.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-2">
                <Label htmlFor="name" className="font-semibold">
                  Nama Kantor / Unit PLN <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Contoh: PT PLN (Persero) UID Lampung"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Alamat Lengkap Kantor</Label>
                <Textarea
                  id="address"
                  rows={2}
                  placeholder="Jl. ZA. Pagar Alam No. 5, Rajabasa, Bandar Lampung"
                  value={form.address}
                  onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                />
              </div>

              {/* Interactive Map Picker Section */}
              <div className="rounded-xl border p-4 bg-muted/20 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">
                      Peta Interaktif Geofencing Presensi
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGetCurrentLocation}
                    disabled={isGettingGps}
                    className="h-8 gap-1.5 text-xs"
                  >
                    {isGettingGps ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <LocateFixed className="size-3.5 text-primary" />
                    )}
                    Ambil Lokasi Saat Ini (GPS)
                  </Button>
                </div>

                {/* Map Component */}
                <OfficeLocationMap
                  latitude={parsedLat}
                  longitude={parsedLng}
                  radiusMeter={parsedRadius}
                  officeName={form.name || 'Kantor PLN'}
                  isInteractive={true}
                  onLocationSelect={handleLocationPicked}
                  heightClassName="h-80 sm:h-96"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="latitude" className="text-xs font-medium">
                      Latitude <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      placeholder="-5.381234"
                      value={form.latitude}
                      onChange={(e) => setForm((prev) => ({ ...prev, latitude: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="longitude" className="text-xs font-medium">
                      Longitude <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      placeholder="105.256789"
                      value={form.longitude}
                      onChange={(e) => setForm((prev) => ({ ...prev, longitude: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="radiusMeter" className="text-xs font-medium">
                      Radius Geofence (Meter) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="radiusMeter"
                      type="number"
                      min="10"
                      max="5000"
                      placeholder="100"
                      value={form.radiusMeter}
                      onChange={(e) => setForm((prev) => ({ ...prev, radiusMeter: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {form.latitude && form.longitude && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground pt-1 border-t">
                    <span>
                      Koordinat: <strong className="text-foreground">{form.latitude}, {form.longitude}</strong> (Radius: <strong className="text-foreground">{form.radiusMeter} m</strong>)
                    </span>
                    <a
                      href={`https://maps.google.com/?q=${form.latitude},${form.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 font-medium shrink-0"
                    >
                      Buka di Google Maps
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Setting Waktu Absensi (Attendance Setting) */}
          <Card className="border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="size-5 text-primary" />
                  Pengaturan Jam & Waktu Absensi Kantor
                </CardTitle>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  Waktu Indonesia Barat (WIB)
                </Badge>
              </div>
              <CardDescription>
                Tentukan jendela waktu check-in, batas toleransi tepat waktu (maksimal jam 08:00 WIB), dan waktu check-out.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Alert standard rule */}
              <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-950 dark:text-amber-100">
                <Info className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Standar Disiplin Presensi SIMAD PLN:</p>
                  <p className="opacity-90">
                    Batas kehadiran tepat waktu adalah <strong>08:00:00 WIB</strong>. Peserta magang yang melakukan presensi di atas jam tersebut akan otomatis ditandai berstatus <strong>TERLAMBAT (LATE)</strong>.
                  </p>
                </div>
              </div>

              {/* Check-in group */}
              <div className="rounded-xl border bg-background p-4 space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  Sesi Masuk (Check-In)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="checkInStart" className="text-xs">
                      Jam Mulai Buka Masuk
                    </Label>
                    <Input
                      id="checkInStart"
                      type="time"
                      value={form.attendanceSetting.checkInStart}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          attendanceSetting: {
                            ...prev.attendanceSetting,
                            checkInStart: e.target.value,
                          },
                        }))
                      }
                      required
                    />
                    <span className="text-[10px] text-muted-foreground">Default: 06:00 WIB</span>
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="lateAfter" className="text-xs font-semibold text-primary">
                      Batas Jam Tepat Waktu (Max)
                    </Label>
                    <Input
                      id="lateAfter"
                      type="time"
                      value={form.attendanceSetting.lateAfter}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          attendanceSetting: {
                            ...prev.attendanceSetting,
                            lateAfter: e.target.value,
                          },
                        }))
                      }
                      required
                      className="border-primary font-bold"
                    />
                    <span className="text-[10px] text-primary font-medium">Lewat jam ini = Terlambat (Default: 08:00)</span>
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="checkInEnd" className="text-xs">
                      Batas Akhir Masuk
                    </Label>
                    <Input
                      id="checkInEnd"
                      type="time"
                      value={form.attendanceSetting.checkInEnd}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          attendanceSetting: {
                            ...prev.attendanceSetting,
                            checkInEnd: e.target.value,
                          },
                        }))
                      }
                      required
                    />
                    <span className="text-[10px] text-muted-foreground">Default: 10:00 WIB</span>
                  </div>
                </div>
              </div>

              {/* Check-out group */}
              <div className="rounded-xl border bg-background p-4 space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <span className="size-2 rounded-full bg-blue-500" />
                  Sesi Pulang (Check-Out)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="checkOutStart" className="text-xs">
                      Jam Mulai Buka Pulang
                    </Label>
                    <Input
                      id="checkOutStart"
                      type="time"
                      value={form.attendanceSetting.checkOutStart}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          attendanceSetting: {
                            ...prev.attendanceSetting,
                            checkOutStart: e.target.value,
                          },
                        }))
                      }
                      required
                    />
                    <span className="text-[10px] text-muted-foreground">Default: 16:00 WIB</span>
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="checkOutEnd" className="text-xs">
                      Batas Akhir Pulang
                    </Label>
                    <Input
                      id="checkOutEnd"
                      type="time"
                      value={form.attendanceSetting.checkOutEnd}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          attendanceSetting: {
                            ...prev.attendanceSetting,
                            checkOutEnd: e.target.value,
                          },
                        }))
                      }
                      required
                    />
                    <span className="text-[10px] text-muted-foreground">Default: 20:00 WIB</span>
                  </div>
                </div>
              </div>

              {/* Weekend toggle */}
              <div className="flex items-center justify-between rounded-xl border bg-background p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="allowWeekend" className="text-sm font-semibold">
                    Izinkan Absensi Akhir Pekan (Sabtu & Minggu)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Aktifkan jika unit ini memberlakukan piket dinas / kegiatan magang pada hari libur akhir pekan.
                  </p>
                </div>
                <Switch
                  id="allowWeekend"
                  checked={form.attendanceSetting.allowWeekend}
                  onCheckedChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      attendanceSetting: {
                        ...prev.attendanceSetting,
                        allowWeekend: val,
                      },
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Embedded Departments Selection */}
        <div className="flex flex-col gap-6">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <Building2 className="size-4 text-primary" />
                  Departemen / Bidang
                </span>
                <Badge variant="secondary" className="text-xs font-mono">
                  {form.departmentIds.length} Dipilih
                </Badge>
              </CardTitle>
              <CardDescription>
                Pilih departemen/divisi yang beroperasi di kantor unit ini.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {departments.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-4">
                  Belum ada data departemen master.
                </p>
              ) : (
                <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
                  {departments.map((dept) => {
                    const isSelected = form.departmentIds.includes(dept.id);
                    return (
                      <button
                        type="button"
                        key={dept.id}
                        onClick={() => handleToggleDepartment(dept.id)}
                        className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-primary font-medium'
                            : 'hover:bg-muted/40 text-foreground border-border'
                        }`}
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="text-sm font-medium truncate">{dept.name}</span>
                          <span className="text-xs text-muted-foreground font-mono">{dept.code}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="size-4 shrink-0 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
