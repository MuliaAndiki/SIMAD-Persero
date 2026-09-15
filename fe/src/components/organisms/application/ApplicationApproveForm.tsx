'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import type { DepartmentResponse } from '@/types/api/department.types';
import type { OfficeResponse } from '@/types/api/office.types';
import type { SupervisorResponse } from '@/types/api/supervisor.types';
import {
  AlertCircle,
  Briefcase,
  Building2,
  CheckCircle2,
  Info,
  MapPin,
  UserCheck,
} from 'lucide-react';
import { type FormEvent, useMemo } from 'react';

export type ApproveApplicationFormField =
  | 'departmentId'
  | 'officeLocationId'
  | 'supervisorId'
  | 'notes';

/** Object state form approve — dimiliki container (§19.4). */
export interface ApproveApplicationFormState {
  departmentId: string;
  officeLocationId: string;
  supervisorId: string;
  notes: string;
}

export interface ApplicationApproveFormProps {
  departments: DepartmentResponse[];
  offices: OfficeResponse[];
  supervisors: SupervisorResponse[];
  form: ApproveApplicationFormState;
  isSubmitting: boolean;
  onFieldChange: (field: ApproveApplicationFormField, value: string) => void;
  onBack: () => void;
  onSubmit: () => void | Promise<void>;
}

/**
 * ApplicationApproveForm — organism form setujui & tugaskan pengajuan.
 * Melakukan pengecekan ketat pada relasi Kantor - Departemen dan Supervisor - Departemen - Kantor
 * untuk mencegah data tidak konsisten dan menghindari crash sistem.
 */
export function ApplicationApproveForm({
  departments = [],
  offices = [],
  supervisors = [],
  form,
  isSubmitting,
  onFieldChange,
  onBack,
  onSubmit,
}: ApplicationApproveFormProps) {
  const safeDepartments = useMemo(
    () => (Array.isArray(departments) ? departments.filter((d) => Boolean(d?.id)) : []),
    [departments],
  );

  const safeOffices = useMemo(
    () => (Array.isArray(offices) ? offices.filter((o) => Boolean(o?.id)) : []),
    [offices],
  );

  const safeSupervisors = useMemo(
    () => (Array.isArray(supervisors) ? supervisors.filter((s) => Boolean(s?.id)) : []),
    [supervisors],
  );

  // Helper pencarian nama departemen dan kantor
  const getDepartmentName = (deptId?: string | null) => {
    if (!deptId) return 'Semua Departemen';
    const dept = safeDepartments.find((d) => d.id === deptId);
    return dept?.name ?? 'Departemen Tidak Ditemukan';
  };

  const getOfficeName = (offId?: string | null) => {
    if (!offId) return 'Semua Kantor';
    const off = safeOffices.find((o) => o.id === offId);
    return off?.name ?? 'Kantor Tidak Ditemukan';
  };

  // 1. Pengecekan Kantor & Departemen yang ter-embed:
  // Cari kantor yang memiliki departemen terpilih di dalam daftar departemennya
  const compatibleOffices = useMemo(() => {
    if (!form.departmentId) return safeOffices;
    const matched = safeOffices.filter((office) =>
      office.departments?.some((d) => d?.id === form.departmentId),
    );
    // Jika ada kantor yang secara spesifik menautkan departemen ini, tampilkan yang cocok.
    // Jika tidak ada data tautan, fallback ke seluruh kantor agar tidak buntu.
    return matched.length > 0 ? matched : safeOffices;
  }, [safeOffices, form.departmentId]);

  const selectedOffice = useMemo(() => {
    return safeOffices.find((o) => o.id === form.officeLocationId) ?? null;
  }, [safeOffices, form.officeLocationId]);

  const selectedOfficeDepartments = useMemo(() => {
    return selectedOffice?.departments ?? [];
  }, [selectedOffice]);

  const isOfficeMatchDepartment = useMemo(() => {
    if (!selectedOffice || !form.departmentId) return true;
    if (!selectedOffice.departments || selectedOffice.departments.length === 0) return true;
    return selectedOffice.departments.some((d) => d.id === form.departmentId);
  }, [selectedOffice, form.departmentId]);

  // 2. Pengecekan Supervisor:
  // Filter supervisor berdasarkan Departemen dan Kantor
  const compatibleSupervisors = useMemo(() => {
    return safeSupervisors.filter((sup) => {
      // Jika departemen dipilih: supervisor harus berada di departemen yang sama
      if (form.departmentId && sup.departmentId && sup.departmentId !== form.departmentId) {
        return false;
      }
      // Jika kantor dipilih: supervisor harus berada di kantor yang sama
      if (form.officeLocationId && sup.officeId && sup.officeId !== form.officeLocationId) {
        return false;
      }
      return true;
    });
  }, [safeSupervisors, form.departmentId, form.officeLocationId]);

  const selectedSupervisor = useMemo(() => {
    return safeSupervisors.find((s) => s.id === form.supervisorId) ?? null;
  }, [safeSupervisors, form.supervisorId]);

  // Validasi tombol submit:
  // Departemen dan Supervisor wajib. Kantor wajib jika master kantor tersedia (mencegah crash absensi).
  const isOfficeRequired = safeOffices.length > 0;
  const canSubmit = Boolean(
    form.departmentId &&
      form.supervisorId &&
      (!isOfficeRequired || form.officeLocationId) &&
      isOfficeMatchDepartment,
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    void onSubmit();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5 text-center sm:text-left">
        <h2 className="text-lg leading-none font-semibold flex items-center gap-2">
          <UserCheck className="size-5 text-primary" />
          Setujui & Tugaskan Pengajuan
        </h2>
        <p className="text-sm text-muted-foreground">
          Pilih departemen, kantor penempatan, dan supervisor yang sesuai untuk peserta magang.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* --- FIELD DEPARTEMEN --- */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Briefcase className="size-3.5 text-muted-foreground" />
            Departemen Penempatan <span className="text-destructive">*</span>
          </span>
          <Select
            value={form.departmentId || undefined}
            onValueChange={(v) => onFieldChange('departmentId', v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih departemen penempatan" />
            </SelectTrigger>
            <SelectContent>
              {safeDepartments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name} {dept.code ? `(${dept.code})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {safeDepartments.length === 0 && (
            <p className="text-xs text-destructive">Belum ada departemen aktif yang terdaftar.</p>
          )}
        </div>

        {/* --- FIELD KANTOR --- */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Building2 className="size-3.5 text-muted-foreground" />
            Lokasi Kantor Penempatan{' '}
            {isOfficeRequired && <span className="text-destructive">*</span>}
          </span>
          <Select
            value={form.officeLocationId || undefined}
            onValueChange={(v) => onFieldChange('officeLocationId', v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  form.departmentId
                    ? 'Pilih kantor yang menampung departemen ini'
                    : 'Pilih lokasi kantor'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {compatibleOffices.map((office) => {
                const embeddedDeptNames = office.departments?.map((d) => d.name).join(', ');
                return (
                  <SelectItem key={office.id} value={office.id}>
                    {office.name} {embeddedDeptNames ? `(Dept: ${embeddedDeptNames})` : ''}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* Info & Departemen ter-embed di kantor terpilih */}
          {selectedOffice && (
            <div className="mt-1 rounded-lg border border-border/70 bg-muted/40 p-2.5 text-xs flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <MapPin className="size-3.5 text-primary" />
                <span>{selectedOffice.name}</span>
                {selectedOffice.radiusMeter && (
                  <span className="text-muted-foreground font-normal">
                    (Radius absensi: {selectedOffice.radiusMeter}m)
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-muted-foreground">Departemen ter-embed:</span>
                {selectedOfficeDepartments.length > 0 ? (
                  selectedOfficeDepartments.map((dept) => {
                    const isCurrent = dept.id === form.departmentId;
                    return (
                      <Badge
                        key={dept.id}
                        variant={isCurrent ? 'default' : 'secondary'}
                        className="text-[11px] py-0 px-1.5"
                      >
                        {dept.name}
                        {isCurrent && <CheckCircle2 className="size-3 ml-0.5" />}
                      </Badge>
                    );
                  })
                ) : (
                  <span className="text-muted-foreground italic">
                    Semua departemen (tidak dibatasi)
                  </span>
                )}
              </div>

              {!isOfficeMatchDepartment && (
                <div className="flex items-center gap-1.5 text-destructive font-medium mt-1">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>Kantor ini tidak meng-embed departemen yang Anda pilih di atas.</span>
                </div>
              )}
            </div>
          )}

          {safeOffices.length === 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Belum ada kantor terdaftar. Peserta tidak dapat melakukan absensi geofencing jika
              kantor kosong.
            </p>
          )}
        </div>

        {/* --- FIELD SUPERVISOR --- */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <UserCheck className="size-3.5 text-muted-foreground" />
            Supervisor Pembimbing <span className="text-destructive">*</span>
          </span>
          <Select
            value={form.supervisorId || undefined}
            onValueChange={(v) => onFieldChange('supervisorId', v)}
            disabled={compatibleSupervisors.length === 0 && safeSupervisors.length > 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  compatibleSupervisors.length === 0
                    ? 'Tidak ada supervisor yang cocok'
                    : 'Pilih supervisor bimbingan'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {compatibleSupervisors.map((sup) => {
                const deptName = getDepartmentName(sup.departmentId);
                const offName = getOfficeName(sup.officeId);
                return (
                  <SelectItem key={sup.id} value={sup.id}>
                    {sup.fullName} — {deptName} • {offName} ({sup.activeAssignmentsCount ?? 0}{' '}
                    intern)
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* Info Card Supervisor Terpilih */}
          {selectedSupervisor ? (
            <div className="mt-1 rounded-lg border border-border/70 bg-muted/40 p-2.5 text-xs flex flex-col gap-1 text-foreground">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{selectedSupervisor.fullName}</span>
                <Badge variant="outline" className="text-[10px]">
                  {selectedSupervisor.activeAssignmentsCount ?? 0} peserta aktif
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-1 text-muted-foreground text-[11px]">
                <div>
                  <span className="font-medium">Departemen:</span>{' '}
                  {getDepartmentName(selectedSupervisor.departmentId)}
                </div>
                <div>
                  <span className="font-medium">Kantor:</span>{' '}
                  {getOfficeName(selectedSupervisor.officeId)}
                </div>
              </div>
            </div>
          ) : (
            compatibleSupervisors.length === 0 &&
            safeSupervisors.length > 0 && (
              <div className="flex items-start gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-400">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>
                  Tidak ada supervisor yang terdaftar di departemen atau kantor yang dipilih.
                  Silakan sesuaikan departemen/kantor atau daftarkan supervisor baru terlebih
                  dahulu.
                </span>
              </div>
            )
          )}
        </div>

        {/* --- FIELD CATATAN --- */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-foreground">Catatan Tambahan</span>
          <textarea
            value={form.notes}
            onChange={(e) => onFieldChange('notes', e.target.value)}
            rows={2}
            placeholder="Catatan persetujuan pengajuan (opsional)…"
            className="border-input placeholder:text-muted-foreground flex min-h-14 w-full rounded-md border bg-transparent px-3 py-2 text-xs shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          />
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-2 pt-2 border-t border-border">
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? 'Menyetujui…' : 'Setujui & Tugaskan'}
          </Button>
        </div>
      </form>
    </div>
  );
}
