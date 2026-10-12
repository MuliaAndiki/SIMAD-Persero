"use client";

import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import type { ApplicationResponse } from "@/types/api/application.types";
import type { DepartmentResponse } from "@/types/api/department.types";
import type { OfficeResponse } from "@/types/api/office.types";
import type { SupervisorResponse } from "@/types/api/supervisor.types";
import { calculateEndDate } from "@/utils/date-utils";
import { formatDate } from "@/utils/string.format";
import {
  AlertCircle,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
  Info,
  MapPin,
  UserCheck,
  Users,
} from "lucide-react";
import { type FormEvent, useMemo } from "react";
import { DOCUMENT_LABELS } from "./DocumentPreview";

/** Null-safe `YYYY-MM-DD` untuk `<input type="date">` — terima string ISO maupun Date. */
export function toDateInput(value: unknown): string {
  if (!value) return "";
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? ""
      : value.toISOString().slice(0, 10);
  }
  if (typeof value === "string") {
    return value.includes("T") ? value.split("T")[0] : value.slice(0, 10);
  }
  return "";
}

function byId<T extends { id: string }>(rows: T[]): Map<string, T> {
  return new Map(rows.map((r) => [r.id, r]));
}

export type ApproveApplicationFormField =
  | "departmentId"
  | "officeLocationId"
  | "supervisorId"
  | "actualStartDate"
  | "durationMonths"
  | "actualEndDate"
  | "notes";

/** Patokan durasi magang (bulan) — sama dengan form pengajuan intern. */
export const INTERNSHIP_DURATION_OPTIONS = [
  { value: "2", label: "2 Bulan" },
  { value: "3", label: "3 Bulan" },
  { value: "4", label: "4 Bulan" },
  { value: "5", label: "5 Bulan" },
  { value: "6", label: "6 Bulan" },
  { value: "7", label: "7 Bulan" },
  { value: "8", label: "8 Bulan" },
  { value: "9", label: "9 Bulan" },
  { value: "10", label: "10 Bulan" },
  { value: "11", label: "11 Bulan" },
  { value: "12", label: "12 Bulan" },
];

/** Object state form approve — dimiliki container (§19.4). */
export interface ApproveApplicationFormState {
  departmentId: string;
  officeLocationId: string;
  supervisorId: string;
  actualStartDate: string;
  durationMonths?: string;
  actualEndDate?: string;
  notes: string;
}

export interface ApplicationApproveFormProps {
  departments: DepartmentResponse[];
  offices: OfficeResponse[];
  supervisors: SupervisorResponse[];
  targetApplication?: ApplicationResponse | null;
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
  const { offices = [], supervisors = [] } = context;
  const next: ApproveApplicationFormState = { ...prev, [field]: value };
  const officeById = byId(offices.filter((o) => o?.id));
  const supById = byId(supervisors.filter((s) => s?.id));

  // Supervisor-supervisor di satu departemen (opsional: cocok kantor).
  const deptSups = (deptId: string, officeId?: string) =>
    supervisors.filter((s) => {
      if (!s?.id || s.departmentId !== deptId) return false;
      if (officeId && s.officeId && s.officeId !== officeId) return false;
      return true;
    });

  if (field === "departmentId") {
    const newDeptId = value;

    // 1. Sesuaikan kantor terhadap departemen baru
    const currentOffice = next.officeLocationId
      ? officeById.get(next.officeLocationId)
      : undefined;
    const officeDepts = currentOffice?.departments ?? [];
    if (
      officeDepts.length > 0 &&
      !officeDepts.some((d) => d?.id === newDeptId)
    ) {
      next.officeLocationId =
        offices.find((o) => o.departments?.some((d) => d?.id === newDeptId))
          ?.id ?? "";
    } else if (!next.officeLocationId) {
      const matching = offices.find((o) =>
        o.departments?.some((d) => d?.id === newDeptId),
      );
      if (matching) next.officeLocationId = matching.id;
    }

    // 2. Sinkronisasi supervisor — pertahankan jika sudah di departemen baru
    const currentSup = next.supervisorId
      ? supById.get(next.supervisorId)
      : undefined;
    if (!currentSup || currentSup.departmentId !== newDeptId) {
      const matching = deptSups(newDeptId, next.officeLocationId || undefined);
      if (matching.length === 1) {
        // Tepat 1 supervisor di departemen & kantor ini -> otomatis pilih
        next.supervisorId = matching[0].id;
        if (!next.officeLocationId && matching[0].officeId) {
          next.officeLocationId = matching[0].officeId;
        }
      } else if (matching.length === 0) {
        const all = deptSups(newDeptId);
        // Tepat 1 supervisor di departemen ini secara keseluruhan
        if (all.length === 1) {
          next.supervisorId = all[0].id;
          if (all[0].officeId) next.officeLocationId = all[0].officeId;
        } else {
          next.supervisorId = "";
        }
      } else {
        // 2+ supervisor (atau tidak ada) -> kosongkan agar HR memilih
        next.supervisorId = "";
      }
    }
  } else if (field === "supervisorId") {
    // Ikut departemen & kantor supervisor terpilih
    const selectedSup = supById.get(value);
    if (selectedSup?.departmentId) next.departmentId = selectedSup.departmentId;
    if (selectedSup?.officeId) next.officeLocationId = selectedSup.officeId;
  } else if (field === "actualStartDate") {
    // Tanggal mulai berubah -> hitung ulang selesai dari durasi (kosongkan bila mulai dikosongkan)
    next.actualEndDate = value
      ? next.durationMonths
        ? calculateEndDate(value, next.durationMonths)
        : next.actualEndDate
      : "";
  } else if (field === "durationMonths") {
    // Durasi berubah -> hitung ulang selesai dari tanggal mulai
    if (value && next.actualStartDate) {
      next.actualEndDate = calculateEndDate(next.actualStartDate, value);
    }
  } else if (field === "officeLocationId") {
    const newOfficeId = value;
    const selectedOffice = officeById.get(newOfficeId);
    const selectedDepts = selectedOffice?.departments ?? [];

    if (next.departmentId && selectedDepts.length > 0) {
      if (!selectedDepts.some((d) => d?.id === next.departmentId)) {
        next.departmentId = selectedDepts[0]?.id ?? "";
        next.supervisorId = "";
      }
    }

    const currentSup = next.supervisorId
      ? supById.get(next.supervisorId)
      : undefined;
    if (currentSup?.officeId && currentSup.officeId !== newOfficeId) {
      const matchingSups = supervisors.filter((s) => {
        if (s.officeId !== newOfficeId) return false;
        if (
          next.departmentId &&
          s.departmentId &&
          s.departmentId !== next.departmentId
        ) {
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
        next.supervisorId = "";
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
  departments: departmentsProp = [],
  offices: officesProp = [],
  supervisors: supervisorsProp = [],
  targetApplication,
  form,
  isSubmitting,
  onFieldChange,
  onBack,
  onSubmit,
}: ApplicationApproveFormProps) {
  // Satu-satunya memo: sanitasi + index O(1). Sisanya derive sepele per render (list kecil).
  const lookup = useMemo(() => {
    const departments = (
      Array.isArray(departmentsProp) ? departmentsProp : []
    ).filter((d) => d?.id);
    const offices = (Array.isArray(officesProp) ? officesProp : []).filter(
      (o) => o?.id,
    );
    const supervisors = (
      Array.isArray(supervisorsProp) ? supervisorsProp : []
    ).filter((s) => s?.id);
    return {
      departments,
      offices,
      supervisors,
      deptById: byId(departments),
      officeById: byId(offices),
      supById: byId(supervisors),
    };
  }, [departmentsProp, officesProp, supervisorsProp]);

  const {
    departments: safeDepartments,
    offices: safeOffices,
    supervisors: safeSupervisors,
  } = lookup;

  // Helper pencarian nama departemen dan kantor
  const getDepartmentName = (deptId?: string | null) => {
    if (!deptId) return "Semua Departemen";
    return lookup.deptById.get(deptId)?.name ?? "Departemen Tidak Ditemukan";
  };

  const getOfficeName = (offId?: string | null) => {
    if (!offId) return "Semua Kantor";
    return lookup.officeById.get(offId)?.name ?? "Kantor Tidak Ditemukan";
  };

  // 1. Pengecekan Kantor & Departemen yang ter-embed:
  const compatibleOffices = !form.departmentId
    ? safeOffices
    : (() => {
        const matched = safeOffices.filter((office) =>
          office.departments?.some((d) => d?.id === form.departmentId),
        );
        return matched.length > 0 ? matched : safeOffices;
      })();

  const selectedOffice = lookup.officeById.get(form.officeLocationId) ?? null;
  const selectedOfficeDepartments = selectedOffice?.departments ?? [];
  const isOfficeMatchDepartment =
    !selectedOffice ||
    !form.departmentId ||
    selectedOfficeDepartments.length === 0 ||
    selectedOfficeDepartments.some((d) => d?.id === form.departmentId);

  // 2. Pengelompokan Supervisor:
  const currentDeptSupervisors = !form.departmentId
    ? []
    : safeSupervisors.filter((sup) => {
        if (sup.departmentId !== form.departmentId) return false;
        if (
          form.officeLocationId &&
          sup.officeId &&
          sup.officeId !== form.officeLocationId
        ) {
          return false;
        }
        return true;
      });

  const otherSupervisors = (() => {
    if (!form.departmentId) return safeSupervisors;
    const currentIds = new Set(currentDeptSupervisors.map((s) => s.id));
    return safeSupervisors.filter((sup) => !currentIds.has(sup.id));
  })();

  const selectedSupervisor = lookup.supById.get(form.supervisorId) ?? null;

  // Validasi tombol submit:
  const isOfficeRequired = safeOffices.length > 0;
  const hasActualStartDate = Boolean(
    form.actualStartDate && form.actualStartDate.trim() !== "",
  );
  const canSubmit = Boolean(
    form.departmentId &&
    form.supervisorId &&
    (!isOfficeRequired || form.officeLocationId) &&
    isOfficeMatchDepartment &&
    hasActualStartDate,
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
          Pilih departemen, kantor penempatan, periode aktual magang, dan mentor
          pembimbing.
        </p>
      </div>

      {/* Dokumen Pelamar (CV & Surat Pengantar) */}
      {targetApplication && (
        <div className="rounded-lg border bg-muted/30 p-3 flex flex-col gap-2">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <FileText className="size-3.5 text-primary" />
            Dokumen Persyaratan Pelamar
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {targetApplication.documents &&
            targetApplication.documents.length > 0 ? (
              targetApplication.documents.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.file?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-background border hover:bg-muted transition-colors"
                >
                  <FileText className="size-3 text-muted-foreground" />
                  <span>{DOCUMENT_LABELS[doc.type] ?? "Dokumen Tambahan"}</span>
                </a>
              ))
            ) : targetApplication.introductionLetterFile?.url ? (
              <a
                href={targetApplication.introductionLetterFile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-background border hover:bg-muted transition-colors"
              >
                <FileText className="size-3 text-muted-foreground" />
                <span>
                  Surat Pengantar (
                  {targetApplication.introductionLetterFile.originalName})
                </span>
              </a>
            ) : (
              <span className="text-xs text-muted-foreground italic">
                Tidak ada lampiran dokumen berkas.
              </span>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* --- FIELD DEPARTEMEN --- */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Briefcase className="size-3.5 text-muted-foreground" />
            Departemen Penempatan <span className="text-destructive">*</span>
          </span>
          <Select
            value={form.departmentId || undefined}
            onValueChange={(v) => onFieldChange("departmentId", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih departemen penempatan" />
            </SelectTrigger>
            <SelectContent>
              {safeDepartments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name} {dept.code ? `(${dept.code})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {safeDepartments.length === 0 && (
            <p className="text-xs text-destructive">
              Belum ada departemen aktif yang terdaftar.
            </p>
          )}
        </div>

        {/* --- FIELD KANTOR --- */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Building2 className="size-3.5 text-muted-foreground" />
            Lokasi Kantor Penempatan{" "}
            {isOfficeRequired && <span className="text-destructive">*</span>}
          </span>
          <Select
            value={form.officeLocationId || undefined}
            onValueChange={(v) => onFieldChange("officeLocationId", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  form.departmentId
                    ? "Pilih kantor yang menampung departemen ini"
                    : "Pilih lokasi kantor"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {compatibleOffices.map((office) => {
                const embeddedDeptNames = office.departments
                  ?.map((d) => d.code)
                  .join(", ");
                return (
                  <SelectItem key={office.id} value={office.id}>
                    {office.name}{" "}
                    {embeddedDeptNames ? `(Dept: ${embeddedDeptNames})` : ""}
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
                <span className="text-muted-foreground">
                  Departemen ter-embed:
                </span>
                {selectedOfficeDepartments.length > 0 ? (
                  selectedOfficeDepartments.map((dept) => {
                    const isCurrent = dept.id === form.departmentId;
                    return (
                      <Badge
                        key={dept.id}
                        variant={isCurrent ? "default" : "secondary"}
                        className="text-[11px] py-0 px-1.5"
                      >
                        {dept.name}
                        {isCurrent && (
                          <CheckCircle2 className="size-3 ml-0.5" />
                        )}
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
                  <span>
                    Kantor ini tidak meng-embed departemen yang Anda pilih di
                    atas.
                  </span>
                </div>
              )}
            </div>
          )}

          {safeOffices.length === 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Belum ada kantor terdaftar. Peserta tidak dapat melakukan absensi
              geofencing jika kantor kosong.
            </p>
          )}
        </div>

        {/* --- FIELD TANGGAL MULAI & DURASI MAGANG --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground" />
              Tanggal Mulai Aktual <span className="text-destructive">*</span>
            </span>
            <input
              type="date"
              value={toDateInput(form.actualStartDate)}
              onChange={(e) => onFieldChange("actualStartDate", e.target.value)}
              className="border-input placeholder:text-muted-foreground flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-xs shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            />
            {!hasActualStartDate && (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Info className="size-3 text-amber-500 shrink-0" />
                Tanggal mulai wajib ditentukan admin untuk perhitungan kuota magang.
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground" />
              Durasi Magang (Minimal 2 Bulan)
            </span>
            <Select
              value={form.durationMonths || undefined}
              onValueChange={(v) => onFieldChange("durationMonths", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih durasi magang" />
              </SelectTrigger>
              <SelectContent>
                {INTERNSHIP_DURATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.actualEndDate && (
              <span className="text-xs text-muted-foreground">
                Estimasi Selesai:{" "}
                <strong className="text-foreground">
                  {formatDate(form.actualEndDate)}
                </strong>
              </span>
            )}
          </div>
        </div>

        {/* --- FIELD SUPERVISOR --- */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <UserCheck className="size-3.5 text-muted-foreground" />
            Mentor Pembimbing <span className="text-destructive">*</span>
          </span>
          <Select
            value={form.supervisorId || undefined}
            onValueChange={(v) => onFieldChange("supervisorId", v)}
            disabled={safeSupervisors.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  safeSupervisors.length === 0
                    ? "Belum ada mentor terdaftar"
                    : form.departmentId &&
                        currentDeptSupervisors.length > 1 &&
                        !form.supervisorId
                      ? `Pilih salah satu (${currentDeptSupervisors.length} mentor di departemen ini)`
                      : form.departmentId && currentDeptSupervisors.length === 0
                        ? "Pilih mentor dari departemen lain"
                        : "Pilih mentor bimbingan"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {form.departmentId && currentDeptSupervisors.length > 0 && (
                <SelectGroup>
                  <SelectLabel className="text-xs font-semibold text-primary">
                    Mentor di {getDepartmentName(form.departmentId)} (
                    {currentDeptSupervisors.length} mentor)
                  </SelectLabel>
                  {currentDeptSupervisors.map((sup) => {
                    const offName = getOfficeName(sup.officeId);
                    return (
                      <SelectItem key={sup.id} value={sup.id}>
                        {sup.fullName} • {offName} (
                        {sup.activeAssignmentsCount ?? 0} magang)
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              )}

              {form.departmentId && currentDeptSupervisors.length === 0 && (
                <SelectGroup>
                  <SelectLabel className="text-xs text-muted-foreground italic">
                    Tidak ada mentor di {getDepartmentName(form.departmentId)}
                  </SelectLabel>
                </SelectGroup>
              )}

              {otherSupervisors.length > 0 && (
                <>
                  {form.departmentId && <SelectSeparator />}
                  <SelectGroup>
                    <SelectLabel className="text-xs font-semibold text-muted-foreground">
                      {form.departmentId
                        ? "Pindah ke Mentor Departemen Lain:"
                        : "Daftar Semua Mentor:"}
                    </SelectLabel>
                    {otherSupervisors.map((sup) => {
                      const deptName = getDepartmentName(sup.departmentId);
                      const offName = getOfficeName(sup.officeId);
                      return (
                        <SelectItem key={sup.id} value={sup.id}>
                          {sup.fullName} — {deptName} • {offName} (
                          {sup.activeAssignmentsCount ?? 0} magang)
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
                <span className="font-semibold">
                  {selectedSupervisor.fullName}
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {selectedSupervisor.activeAssignmentsCount ?? 0} peserta aktif
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-1 text-muted-foreground text-[11px]">
                <div>
                  <span className="font-medium">Departemen:</span>{" "}
                  {getDepartmentName(selectedSupervisor.departmentId)}
                </div>
                <div>
                  <span className="font-medium">Kantor:</span>{" "}
                  {getOfficeName(selectedSupervisor.officeId)}
                </div>
              </div>
              {currentDeptSupervisors.length > 1 && (
                <div className="mt-1 text-[11px] text-muted-foreground flex items-center gap-1 border-t border-border/50 pt-1.5">
                  <Info className="size-3 text-primary shrink-0" />
                  <span>
                    Departemen ini memiliki {currentDeptSupervisors.length}{" "}
                    mentor di kantor yang sama. Anda dapat memilih mentor lain
                    di departemen ini tanpa mengubah departemen.
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
                  Departemen {getDepartmentName(form.departmentId)} memiliki{" "}
                  {currentDeptSupervisors.length} mentor. Silakan pilih salah
                  satu mentor di atas.
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
                  Tidak ada mentor yang terdaftar di departemen ini pada kantor
                  terpilih. Silakan pilih mentor dari opsi departemen lain pada
                  dropdown di atas (departemen dan kantor akan otomatis
                  disesuaikan).
                </span>
              </div>
            )}
        </div>

        {/* --- FIELD CATATAN --- */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-foreground">
            Catatan Tambahan
          </span>
          <textarea
            value={form.notes}
            onChange={(e) => onFieldChange("notes", e.target.value)}
            rows={2}
            placeholder="Catatan persetujuan pengajuan (opsional)…"
            className="border-input placeholder:text-muted-foreground flex min-h-14 w-full rounded-md border bg-transparent px-3 py-2 text-xs shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          />
        </div>

        <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border">
          {!hasActualStartDate && (
            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 justify-end">
              <AlertCircle className="size-3.5 shrink-0" />
              Tentukan tanggal mulai aktual terlebih dahulu untuk menyetujui pengajuan (slot kuota terbatas).
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Menyetujui…" : "Setujui & Tugaskan"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
