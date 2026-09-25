'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import type { OfficeResponse } from '@/types/api/office.types';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  ExternalLink,
  MapPin,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import React from 'react';
import { Loader2 } from 'lucide-react';

/** Peta interaktif Leaflet di-load secara dinamis dengan SSR dinonaktifkan */
const OfficeLocationMap = dynamic(
  () => import('@/components/organisms/office/OfficeLocationMap').then((mod) => mod.OfficeLocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-72 sm:h-80 w-full flex-col items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span>Memuat peta lokasi kantor…</span>
      </div>
    ),
  },
);

interface OfficeDetailSectionProps {
  office: OfficeResponse;
  isDeleting: boolean;
  onDelete: () => void;
}

export function OfficeDetailSection({
  office,
  isDeleting,
  onDelete,
}: OfficeDetailSectionProps) {
  const setting = office.attendanceSetting;
  const quotas = office.internshipQuotas || [];
  const activeQuota = quotas[0] || null;

  return (
    <section className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/hr_admin/offices" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="size-3.5" />
              Daftar Kantor
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{office.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="size-7 text-primary" />
            {office.name}
          </h1>
          {office.address && (
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              <MapPin className="size-4 text-muted-foreground shrink-0" />
              {office.address}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" asChild>
            <Link href="/hr_admin/offices">
              <ArrowLeft className="size-4 mr-1.5" />
              Kembali
            </Link>
          </Button>
          <Button variant="outline" className="text-destructive hover:bg-destructive/10" onClick={onDelete} disabled={isDeleting}>
            <Trash2 className="size-4 mr-1.5" />
            Hapus Kantor
          </Button>
          <Button asChild>
            <Link href={`/hr_admin/offices/${office.id}/edit`}>
              <Edit className="size-4 mr-1.5" />
              Ubah Kantor & Jadwal
            </Link>
          </Button>
        </div>
      </div>

      {/* Map & Geolocation Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                Peta Lokasi Kantor & Radius Geofence Presensi
              </CardTitle>
              <CardDescription>
                Area lingkaran biru menunjukkan zona valid presensi GPS (Radius: {office.radiusMeter} meter).
              </CardDescription>
            </div>
            {office.latitude && office.longitude && (
              <a
                href={`https://maps.google.com/?q=${office.latitude},${office.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/5 shrink-0"
              >
                <ExternalLink className="size-3.5" />
                Buka di Google Maps
              </a>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <OfficeLocationMap
            latitude={office.latitude}
            longitude={office.longitude}
            radiusMeter={office.radiusMeter}
            officeName={office.name}
            isInteractive={false}
            heightClassName="h-80 sm:h-96"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t text-xs">
            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-2.5 border">
              <span className="text-muted-foreground">Radius Toleransi:</span>
              <Badge variant="secondary" className="font-mono font-semibold">
                {office.radiusMeter} Meter
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-2.5 border">
              <span className="text-muted-foreground">Latitude:</span>
              <span className="font-mono font-medium">{office.latitude ?? '-'}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-2.5 border">
              <span className="text-muted-foreground">Longitude:</span>
              <span className="font-mono font-medium">{office.longitude ?? '-'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards Grid: Time Settings, Depts, Quota */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Setting Waktu Presensi */}
        <Card className="md:col-span-3 border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                Pengaturan Waktu Absensi (WIB)
              </CardTitle>
              <Badge variant="default" className="bg-emerald-600 text-xs">
                {setting?.allowWeekend ? 'Senin - Minggu (Termasuk Libur)' : 'Senin - Jumat (Hari Kerja)'}
              </Badge>
            </div>
            <CardDescription>
              Aturan jam buka masuk, batas tepat waktu, dan jam pulang untuk unit kantor ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Check-In info */}
              <div className="rounded-xl border bg-background p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Sesi Masuk (Check-In)
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 border-emerald-300">
                    Batas: {setting?.lateAfter ?? '08:00'} WIB
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    Rentang Waktu: <strong>{setting?.checkInStart ?? '06:00'}</strong> s/d{' '}
                    <strong>{setting?.checkInEnd ?? '10:00'} WIB</strong>
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">
                    * Lewat dari jam <strong>{setting?.lateAfter ?? '08:00'} WIB</strong> otomatis dianggap <span className='font-bold text-red-700'>Terlambat</span>.
                  </p>
                </div>
              </div>

              {/* Check-Out info */}
              <div className="rounded-xl border bg-background p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                    <span className="size-2 rounded-full bg-blue-500" />
                    Sesi Pulang (Check-Out)
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-700 border-blue-300">
                    Mulai: {setting?.checkOutStart ?? '16:00'} WIB
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    Rentang Waktu: <strong>{setting?.checkOutStart ?? '16:00'}</strong> s/d{' '}
                    <strong>{setting?.checkOutEnd ?? '20:00'} WIB</strong>
                  </p>
                  <p className="text-[11px]">
                    Presensi pulang wajib dilakukan sebelum jam <strong>{setting?.checkOutEnd ?? '20:00'} WIB</strong>.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Embedded Departments & Quota Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Departemen yang dinaungi */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                Departemen / Bidang Penempatan
              </span>
              <Badge variant="secondary" className="text-xs font-mono">
                {office.departments.length} Bidang
              </Badge>
            </CardTitle>
            <CardDescription>
              Daftar divisi/bidang yang bernaung di bawah kantor {office.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {office.departments.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-4 text-center">
                Belum ada departemen yang dihubungkan ke kantor ini.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {office.departments.map((dept) => (
                  <Badge
                    key={dept.id}
                    variant="outline"
                    className="p-2 gap-1.5 text-xs font-medium bg-muted/40"
                  >
                    <Building2 className="size-3.5 text-primary" />
                    <span>{dept.name}</span>
                    {dept.code && <span className="text-[10px] text-muted-foreground">({dept.code})</span>}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Kuota Magang Kantor */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="size-4 text-primary" />
                Kapasitas Kuota Magang Kantor
              </span>
              {activeQuota && (
                <Badge variant="default" className="bg-primary">
                  {activeQuota.totalCapacity} Total Slot
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Alokasi kuota penerimaan peserta magang per bidang di kantor ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!activeQuota ? (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  Belum ada master kuota yang dikonfigurasi untuk kantor ini.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/hr_admin/quotas">Atur Kuota Magang</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b">
                  <span className="text-muted-foreground">Total Kapasitas Kuota:</span>
                  <strong className="text-foreground">{activeQuota.totalCapacity} Peserta</strong>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground block">Alokasi per Departemen:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(activeQuota.departmentAllocations || []).map((alloc: any) => (
                      <Badge
                        key={alloc.id || alloc.departmentId}
                        variant="secondary"
                        className="text-xs py-1 px-2.5"
                      >
                        <span className="font-medium mr-1">{alloc.department?.name ?? 'Dept'}:</span>
                        <strong>{alloc.capacity} Slot</strong>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
