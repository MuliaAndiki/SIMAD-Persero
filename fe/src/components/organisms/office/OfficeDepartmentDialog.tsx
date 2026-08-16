"use client";

import { Building2 } from "lucide-react";
import type { FormEvent } from "react";

import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
import type { DepartmentResponse } from "@/types/api/department.types";
import type { OfficeResponse } from "@/types/api/office.types";

export interface OfficeDepartmentDialogProps {
  open: boolean;
  office: OfficeResponse | null;
  departments: DepartmentResponse[];
  selectedIds: string[];
  isSaving: boolean;
  onToggle: (departmentId: string) => void;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
}

/**
 * OfficeDepartmentDialog — dialog mengisi daftar departemen yang dilayani
 * sebuah kantor (relasi many-to-many). Pilihan disimpan di container sebagai
 * `selectedIds`, dikirim via PATCH /offices/:officeId { departmentIds }.
 */
export function OfficeDepartmentDialog({
  open,
  office,
  departments,
  selectedIds,
  isSaving,
  onToggle,
  onClose,
  onSubmit,
}: OfficeDepartmentDialogProps) {
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isSaving) onClose();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="size-5" />
            Kelola Departemen Kantor
          </DialogTitle>
          <DialogDescription>
            Pilih departemen yang dilayani oleh{" "}
            <span className="font-medium text-foreground">
              {office?.name ?? "kantor"}
            </span>
            .
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {departments.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Belum ada departemen terdaftar.
              </p>
            </div>
          ) : (
            <div className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
              {departments.map((department) => {
                const checked = selectedIds.includes(department.id);
                return (
                  <label
                    key={department.id}
                    className="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50 has-[:checked]:border-primary/40 has-[:checked]:bg-primary/5"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(department.id)}
                      className="size-4 shrink-0 accent-primary"
                    />
                    <span className="flex-1 font-medium">
                      {department.name}
                    </span>
                    {department.code && (
                      <span className="text-xs text-muted-foreground">
                        {department.code}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
