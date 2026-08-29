"use client";

import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import {
  UniversityFormDialog,
  type UniversityFormField,
  type UniversityFormState,
} from "@/components/organisms/institution/UniversityFormDialog";
import type {
  EducationLevelResponse,
  InstitutionResponse,
} from "@/types/api/institution.types";
import type { AlertContexType } from "@/types/ui";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  GraduationCap,
  Image as ImageIcon,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";

export interface UniversityDetailSectionState {
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  university: InstitutionResponse | null;
  educationLevels: EducationLevelResponse[];
  formOpen: boolean;
  editing: InstitutionResponse | null;
  form: UniversityFormState;
  isSaving: boolean;
  isDeleting: boolean;
  alert: AlertContexType;
}

export interface UniversityDetailSectionActions {
  onOpenEdit: () => void;
  onCloseForm: () => void;
  onFieldChange: (field: UniversityFormField, value: string) => void;
  onSubmit: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
}

export interface UniversityDetailSectionProps {
  state: UniversityDetailSectionState;
  actions: UniversityDetailSectionActions;
}

export function UniversityDetailSection({
  state,
  actions,
}: UniversityDetailSectionProps) {
  const { university, isPending, isError, errorMessage, alert, isDeleting } =
    state;

  if (isPending) {
    return (
      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/hr_admin/universities">
              <ArrowLeft className="size-4" />
              Kembali
            </Link>
          </Button>
          <div className="h-8 w-64 animate-pulse rounded-md bg-muted/60" />
        </div>
        <Card className="h-96 animate-pulse bg-muted/40" />
      </section>
    );
  }

  if (isError || !university) {
    return (
      <section className="flex flex-col gap-6">
        <div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/hr_admin/universities">
              <ArrowLeft className="size-4" />
              Kembali ke Daftar Universitas
            </Link>
          </Button>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div className="flex flex-col gap-1">
            <p className="font-semibold">Gagal memuat detail universitas</p>
            <p className="opacity-90">
              {errorMessage || "Data universitas tidak ditemukan."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      {/* Navigation & Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" size="sm" asChild className="w-fit">
          <Link href="/hr_admin/universities">
            <ArrowLeft className="size-4" />
            Kembali ke Daftar Universitas
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={actions.onOpenEdit}>
            <Pencil className="size-4" />
            Edit Universitas
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={isDeleting}
            onClick={() =>
              alert.confirm({
                title: "Hapus Universitas?",
                deskripsi: `Apakah Anda yakin ingin menghapus "${university.name}"? Tindakan ini tidak dapat dibatalkan.`,
                icon: "question",
                confirmButtonText: "Hapus",
                onConfirm: () => {
                  actions.onDelete();
                },
              })
            }
          >
            <Trash2 className="size-4" />
            Hapus Universitas
          </Button>
        </div>
      </div>

      {/* Main Header Banner Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            {university.logo ? (
              <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/20 p-2">
                <img
                  src={university.logo as string}
                  alt={university.name || "Logo"}
                  className="size-full object-contain"
                />
              </div>
            ) : (
              <div className="flex size-20 shrink-0 items-center justify-center rounded-xl border border-border bg-primary/10">
                <GraduationCap className="size-10 text-primary" />
              </div>
            )}

            <div className="flex flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {university.name}
                </h1>
                {university.shortName && (
                  <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    {university.shortName}
                  </span>
                )}
                {university.educationLevel?.name && (
                  <span className="rounded-md border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-foreground">
                    {university.educationLevel.name}
                  </span>
                )}
              </div>

              {(university.city || university.province) && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-4 shrink-0 text-muted-foreground/70" />
                  <span>
                    {[university.city, university.province]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="size-4 text-primary" />
              Detail Informasi Institusi
            </CardTitle>
            <CardDescription>
              Rincian lengkap master data perguruan tinggi
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border/60 text-sm">
            <div className="flex flex-col justify-between py-3 sm:flex-row">
              <span className="text-muted-foreground">
                Nama Lengkap Institusi
              </span>
              <span className="font-semibold text-foreground">
                {university.name}
              </span>
            </div>
            <div className="flex flex-col justify-between py-3 sm:flex-row">
              <span className="text-muted-foreground">
                Akronim / Nama Pendek
              </span>
              <span className="font-medium text-foreground">
                {university.shortName ? (
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    {university.shortName}
                  </span>
                ) : (
                  "-"
                )}
              </span>
            </div>
            <div className="flex flex-col justify-between py-3 sm:flex-row">
              <span className="text-muted-foreground">Jenjang Pendidikan</span>
              <span className="font-medium text-foreground">
                {university.educationLevel?.name || "-"}
              </span>
            </div>
            <div className="flex flex-col justify-between py-3 sm:flex-row">
              <span className="text-muted-foreground">Provinsi</span>
              <span className="font-medium text-foreground">
                {university.province || "-"}
              </span>
            </div>
            <div className="flex flex-col justify-between py-3 sm:flex-row">
              <span className="text-muted-foreground">Kota / Kabupaten</span>
              <span className="font-medium text-foreground">
                {university.city || "-"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-base">
              <ImageIcon className="size-4 text-primary" />
              Logo & Media
            </CardTitle>
            <CardDescription>
              Preview logo dan link asset institusi
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-4 text-sm">
            {university.logo ? (
              <div className="flex flex-col gap-3">
                <div className="flex max-h-48 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/10 p-4">
                  <img
                    src={university.logo as string}
                    alt={university.name || "Logo Preview"}
                    className="max-h-40 object-contain"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    URL Logo:
                  </span>
                  <a
                    href={university.logo as string}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-xs text-primary underline hover:opacity-80"
                  >
                    {university.logo as string}
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground">
                <ImageIcon className="size-8 text-muted-foreground/40" />
                <p className="text-xs">
                  Belum ada logo terlampir untuk universitas ini.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Form Dialog */}
      <UniversityFormDialog
        open={state.formOpen}
        editing={state.editing}
        form={state.form}
        educationLevels={state.educationLevels}
        isSaving={state.isSaving}
        onFieldChange={actions.onFieldChange}
        onClose={actions.onCloseForm}
        onSubmit={actions.onSubmit}
      />
    </section>
  );
}
