"use client";

import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import type {
  EducationLevelResponse,
  InstitutionResponse,
} from "@/types/api/institution.types";
import { uploadUnivLogo } from "@/utils/r2-utils";
import { GraduationCap, ImagePlus, Loader2, X } from "lucide-react";
import { type ChangeEvent, type FormEvent, useState } from "react";

export interface UniversityFormState {
  name: string;
  shortName: string;
  educationLevelId: string;
  province: string;
  city: string;
  logo: string;
}

export type UniversityFormField = keyof UniversityFormState;

export interface UniversityFormDialogProps {
  open: boolean;
  editing: InstitutionResponse | null;
  form: UniversityFormState;
  educationLevels: EducationLevelResponse[];
  isSaving: boolean;
  onFieldChange: (field: UniversityFormField, value: string) => void;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
}

export function UniversityFormDialog({
  open,
  editing,
  form,
  educationLevels,
  isSaving,
  onFieldChange,
  onClose,
  onSubmit,
}: UniversityFormDialogProps) {
  const [isUploading, setIsUploading] = useState(false);

  if (!open) return null;

  const handleLogoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadUnivLogo(file);
      onFieldChange("logo", url);
    } catch (err) {
      console.error("Failed to upload logo:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    onFieldChange("logo", "");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {editing
              ? "Edit Universitas / Institusi"
              : "Tambah Universitas / Institusi"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={onClose}
            aria-label="Tutup"
          >
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Logo Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Logo Universitas
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30">
                {form.logo ? (
                  <img
                    src={form.logo}
                    alt="Logo preview"
                    className="size-full object-contain p-1"
                  />
                ) : (
                  <GraduationCap className="size-6 text-muted-foreground/50" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="size-5 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground">
                    <ImagePlus className="size-3.5" />
                    <span>{form.logo ? "Ganti Logo" : "Upload Logo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                  {form.logo && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-destructive hover:bg-destructive/10"
                      onClick={handleRemoveLogo}
                    >
                      Hapus
                    </Button>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground">
                  PNG, JPG, SVG maks 2MB
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Nama Universitas / Perguruan Tinggi{" "}
              <span className="text-destructive">*</span>
            </label>
            <Input
              value={form.name}
              onChange={(e) => onFieldChange("name", e.target.value)}
              placeholder="Contoh: Universitas Gadjah Mada"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Singkatan / Akronim
              </label>
              <Input
                value={form.shortName}
                onChange={(e) => onFieldChange("shortName", e.target.value)}
                placeholder="Contoh: UGM"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Tingkat Pendidikan
              </label>
              <select
                value={form.educationLevelId}
                onChange={(e) =>
                  onFieldChange("educationLevelId", e.target.value)
                }
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">-- Pilih --</option>
                {educationLevels.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.name} ({lvl.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Provinsi
              </label>
              <Input
                value={form.province}
                onChange={(e) => onFieldChange("province", e.target.value)}
                placeholder="D.I. Yogyakarta"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Kota / Kabupaten
              </label>
              <Input
                value={form.city}
                onChange={(e) => onFieldChange("city", e.target.value)}
                placeholder="Sleman"
              />
            </div>
          </div>

          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={!form.name.trim() || isSaving || isUploading}
            >
              {isSaving ? "Menyimpan…" : "Simpan"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
