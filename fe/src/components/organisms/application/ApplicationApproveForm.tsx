'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
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
 * Logika sinkronisasi dua arah antara Departemen, Kantor, dan Supervisor:
 * 1. Pindah Departemen:
 *    - Supervisor otomatis disinkronkan ke supervisor di departemen tersebut.
 *    - Jika ada 1 supervisor: otomatis terpilih.
 *    - Jika ada 2 atau lebih supervisor (bisa lebih dari 1 di departemen/kantor yang sama):
 *      dikosongkan agar HR memilih salah satunya, dan jika supervisor saat ini memang sudah di departemen itu, tetap dipertahankan.
 * 2. Pindah Supervisor:
 *    - Otomatis memindahkan departemen ke departemen supervisor tersebut.
 *    - Jika pindah ke supervisor lain yang berada di departemen yang sama (misal ada 2 supervisor di kantor/departemen yang sama),
 *      departemen tetap sama (tidak berubah).
 *    - Otomatis memindahkan kantor penempatan ke kantor supervisor tersebut.
 */
export function syncApproveFormField(
  prev: ApproveApplicationFormState,
  field: ApproveApplicationFormField,
  value: string,
  context: {
    departments?: DepartmentResponse[];
    offices?: OfficeResponse[];
    supervisors?: SupervisorResponse[];
  },
): ApproveApplicationFormState {
  const { departments: _departments = [], offices = [], supervisors = [] } = context;
  const next: ApproveApplicationFormState = { ...prev, [field]: value };

  if (field === 'departmentId') {
    const newDeptId = value;

    // 1. Validasi / sesuaikan kantor terhadap departemen baru
    if (next.officeLocationId) {
      const currentOffice = offices.find((o) => o.id === next.officeLocationId);
      const officeSupportsDept = currentOffice?.departments?.some((d) => d.id === newDeptId);
      if (
        currentOffice?.departments &&
        currentOffice.departments.length > 0 &&
        !officeSupportsDept
      ) {
        const matchingOffice = offices.find((o) => o.departments?.some((d) => d.id === newDeptId));
        next.officeLocationId = matchingOffice ? matchingOffice.id : '';
      }
    } else {
      const matchingOffice = offices.find((o) => o.departments?.some((d) => d.id === newDeptId));
      if (matchingOffice) {
        next.officeLocationId = matchingOffice.id;
      }
    }

    // 2. Sinkronisasi Supervisor terhadap Departemen baru
    const currentSup = supervisors.find((s) => s.id === next.supervisorId);
    // Jika supervisor saat ini sudah berada di departemen baru ini, pertahankan
    if (!currentSup || currentSup.departmentId !== newDeptId) {
      const deptSups = supervisors.filter((s) => s.departmentId === newDeptId);
      const officeMatchingSups = deptSups.filter((s) => {
        if (next.officeLocationId && s.officeId && s.officeId !== next.officeLocationId) {
          return false;
        }
        return true;
      });

      if (officeMatchingSups.length === 1) {
        // Tepat 1 supervisor di departemen & kantor ini -> otomatis pilih
        next.supervisorId = officeMatchingSups[0].id;
        if (!next.officeLocationId && officeMatchingSups[0].officeId) {
          next.officeLocationId = officeMatchingSups[0].officeId;
        }
      } else if (officeMatchingSups.length === 0 && deptSups.length === 1) {
        // Tepat 1 supervisor di departemen ini secara keseluruhan
        next.supervisorId = deptSups[0].id;
        if (deptSups[0].officeId) {
          next.officeLocationId = deptSups[0].officeId;
        }
      } else {
        // Jika ada 2 atau lebih supervisor (atau tidak ada), kosongkan agar user memilih
        next.supervisorId = '';
      }
    }
  } else if (field === 'supervisorId') {
    const newSupId = value;
    const selectedSup = supervisors.find((s) => s.id === newSupId);

    if (selectedSup) {
      // Sinkronkan departemen ke departemen supervisor terpilih
      if (selectedSup.departmentId) {
        next.departmentId = selectedSup.departmentId;
      }

      // Sinkronkan kantor ke kantor supervisor terpilih
      if (selectedSup.officeId) {
        next.officeLocationId = selectedSup.officeId;
      }
    }
  } else if (field === 'officeLocationId') {
    const newOfficeId = value;
    const selectedOffice = offices.find((o) => o.id === newOfficeId);

    if (next.departmentId && selectedOffice?.departments && selectedOffice.departments.length > 0) {
      const officeSupportsDept = selectedOffice.departments.some((d) => d.id === next.departmentId);
      if (!officeSupportsDept) {
        next.departmentId = selectedOffice.departments[0]?.id ?? '';
        next.supervisorId = '';
      }
    }

    const currentSup = supervisors.find((s) => s.id === next.supervisorId);
    if (currentSup?.officeId && currentSup.officeId !== newOfficeId) {
      const matchingSups = supervisors.filter((s) => {
        if (s.officeId !== newOfficeId) return false;
        if (next.departmentId && s.departmentId && s.departmentId !== next.departmentId) {
          return false;
        }
        return true;
      });

      if (matchingSups.length === 1) {
        next.supervisorId = matchingSups[0].id;
        if (matchingSups[0].departmentId) {
          next.departmentId = matchingSups[0].departmentId;
        }
      } else {
        next.supervisorId = '';
      }
    }
  }

  return next;
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
  const compatibleOffices = useMemo(() => {
    if (!form.departmentId) return safeOffices;
    const matched = safeOffices.filter((office) =>
      office.departments?.some((d) => d?.id === form.departmentId),
    );
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

  // 2. Pengelompokan Supervisor:
  // Supervisor di departemen yang dipilih saat ini (bisa 1 atau lebih supervisor)
  const currentDeptSupervisors = useMemo(() => {
    if (!form.departmentId) return [];
    return safeSupervisors.filter((sup) => {
      if (sup.departmentId !== form.departmentId) return false;
      if (form.officeLocationId && sup.officeId && sup.officeId !== form.officeLocationId) {
        return false;
      }
      return true;
    });
  }, [safeSupervisors, form.departmentId, form.officeLocationId]);

  // Supervisor lainnya (departemen lain atau kantor lain) agar HR bisa langsung pindah supervisor
  const otherSupervisors = useMemo(() => {
    if (!form.departmentId) return safeSupervisors;
    return safeSupervisors.filter((sup) => {
      return !currentDeptSupervisors.some((cs) => cs.id === sup.id);
    });
  }, [safeSupervisors, form.departmentId, currentDeptSupervisors]);

  const selectedSupervisor = useMemo(() => {
    return safeSupervisors.find((s) => s.id === form.supervisorId) ?? null;
  }, [safeSupervisors, form.supervisorId]);

  // Validasi tombol submit:
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
            disabled={safeSupervisors.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  safeSupervisors.length === 0
                    ? 'Belum ada supervisor terdaftar'
                    : form.departmentId && currentDeptSupervisors.length > 1 && !form.supervisorId
                      ? `Pilih salah satu (${currentDeptSupervisors.length} supervisor di departemen ini)`
                      : form.departmentId && currentDeptSupervisors.length === 0
                        ? 'Pilih supervisor dari departemen lain'
                        : 'Pilih supervisor bimbingan'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {/* Jika departemen terpilih dan memiliki supervisor */}
              {form.departmentId && currentDeptSupervisors.length > 0 && (
                <SelectGroup>
                  <SelectLabel className="text-xs font-semibold text-primary">
                    Supervisor di {getDepartmentName(form.departmentId)} (
                    {currentDeptSupervisors.length} supervisor)
                  </SelectLabel>
                  {currentDeptSupervisors.map((sup) => {
                    const offName = getOfficeName(sup.officeId);
                    return (
                      <SelectItem key={sup.id} value={sup.id}>
                        {sup.fullName} • {offName} ({sup.activeAssignmentsCount ?? 0} intern)
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              )}

              {/* Jika departemen terpilih namun belum ada supervisor di departemen ini */}
              {form.departmentId && currentDeptSupervisors.length === 0 && (
                <SelectGroup>
                  <SelectLabel className="text-xs text-muted-foreground italic">
                    Tidak ada supervisor di {getDepartmentName(form.departmentId)}
                  </SelectLabel>
                </SelectGroup>
              )}

              {/* Supervisor departemen lain (memungkinkan langsung pindah supervisor & departemen) */}
              {otherSupervisors.length > 0 && (
                <>
                  {form.departmentId && <SelectSeparator />}
                  <SelectGroup>
                    <SelectLabel className="text-xs font-semibold text-muted-foreground">
                      {form.departmentId
                        ? 'Pindah ke Supervisor Departemen Lain:'
                        : 'Daftar Semua Supervisor:'}
                    </SelectLabel>
                    {otherSupervisors.map((sup) => {
                      const deptName = getDepartmentName(sup.departmentId);
                      const offName = getOfficeName(sup.officeId);
                      return (
                        <SelectItem key={sup.id} value={sup.id}>
                          {sup.fullName} — {deptName} • {offName} ({sup.activeAssignmentsCount ?? 0}{' '}
                          intern)
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </>
              )}
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
              {currentDeptSupervisors.length > 1 && (
                <div className="mt-1 text-[11px] text-muted-foreground flex items-center gap-1 border-t border-border/50 pt-1.5">
                  <Info className="size-3 text-primary shrink-0" />
                  <span>
                    Departemen ini memiliki {currentDeptSupervisors.length} supervisor di kantor
                    yang sama. Anda dapat memilih supervisor lain di departemen ini tanpa mengubah
                    departemen.
                  </span>
                </div>
              )}
            </div>
          ) : (
            form.departmentId &&
            currentDeptSupervisors.length > 1 && (
              <div className="flex items-start gap-1.5 rounded-md border border-primary/30 bg-primary/10 p-2 text-xs text-primary dark:text-primary">
                <Info className="size-4 shrink-0 mt-0.5" />
                <span>
                  Departemen {getDepartmentName(form.departmentId)} memiliki{' '}
                  {currentDeptSupervisors.length} supervisor. Silakan pilih salah satu supervisor di
                  atas.
                </span>
              </div>
            )
          )}

          {!selectedSupervisor &&
            form.departmentId &&
            currentDeptSupervisors.length === 0 &&
            safeSupervisors.length > 0 && (
              <div className="flex items-start gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-400">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>
                  Tidak ada supervisor yang terdaftar di departemen ini pada kantor terpilih.
                  Silakan pilih supervisor dari opsi departemen lain pada dropdown di atas
                  (departemen dan kantor akan otomatis disesuaikan).
                </span>
              </div>
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
