"use client";

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
import { Input } from "@/components/atoms/input";
import type { OfficeResponse } from "@/types/api/office.types";
import type { CreateSupervisorBody } from "@/types/api/supervisor.types";
import { DecoratedInput } from "@/components/wrapper";
import { Eye, EyeOff } from "lucide-react";

export type SupervisorFormType = CreateSupervisorBody & {
  isActive?: boolean;
  /** UI-only: dipakai untuk memfilter departemen berdasarkan kantor. */
  officeId?: string;
};

export interface SupervisorFormDialogProps {
  open: boolean;
  isEditing: boolean;
  onClose: () => void;
  offices: OfficeResponse[];
  formData: SupervisorFormType;
  onChange: (data: Partial<SupervisorFormType>) => void;
  onSubmit: () => void | Promise<void>;
  isPending: boolean;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
}

export function SupervisorFormDialog({
  open,
  isEditing,
  onClose,
  offices,
  formData,
  onChange,
  onSubmit,
  isPending,
  setShowPassword,
  showPassword,
}: SupervisorFormDialogProps) {
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit();
  };

  const filteredDepartments = formData.officeId
    ? (offices.find((o) => o.id === formData.officeId)?.departments ?? [])
    : [];

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Supervisor" : "Buat Supervisor"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Ubah detail data supervisor."
                : "Tambahkan akun supervisor baru ke dalam sistem."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                Nama Lengkap
              </label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => onChange({ fullName: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => onChange({ email: e.target.value })}
                placeholder="john.doe@example.com"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="officeId" className="text-sm font-medium">
                Kantor
              </label>
              <select
                id="officeId"
                value={formData.officeId ?? ""}
                onChange={(e) =>
                  onChange({ officeId: e.target.value, departmentId: "" })
                }
                required
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>
                  Pilih kantor...
                </option>
                {offices.map((office) => (
                  <option key={office.id} value={office.id}>
                    {office.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="departmentId" className="text-sm font-medium">
                Departemen
              </label>
              <select
                id="departmentId"
                value={formData.departmentId}
                onChange={(e) => onChange({ departmentId: e.target.value })}
                required
                disabled={!formData.officeId}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>
                  {formData.officeId
                    ? "Pilih departemen..."
                    : "Pilih kantor terlebih dahulu"}
                </option>
                {filteredDepartments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password {isEditing && "(Opsional)"}
              </label>
              <DecoratedInput
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password || ""}
                onChange={(e) => onChange({ password: e.target.value })}
                placeholder={
                  isEditing ? "Kosongkan jika tidak ingin diubah" : "••••••••"
                }
                required={!isEditing}
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex items-center justify-center text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                }
              />
            </div>
            {isEditing && (
              <div className="flex flex-col gap-2">
                <label htmlFor="isActive" className="text-sm font-medium">
                  Status Akun
                </label>
                <select
                  id="isActive"
                  value={formData.isActive ? "true" : "false"}
                  onChange={(e) =>
                    onChange({ isActive: e.target.value === "true" })
                  }
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
