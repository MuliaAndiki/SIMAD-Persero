'use client';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Input } from '@/components/atoms/input';
import type { DepartmentResponse } from '@/types/api/department.types';
import type { FormEvent } from 'react';

export type DepartmentFormField = 'code' | 'name' | 'description';

/** Object state form departemen — dimiliki container (§19.4). */
export interface DepartmentFormState {
  code: string;
  name: string;
  description: string;
}

export interface DepartmentFormDialogProps {
  open: boolean;
  editing: DepartmentResponse | null;
  form: DepartmentFormState;
  isSaving: boolean;
  onFieldChange: (field: DepartmentFormField, value: string) => void;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
}

/**
 * DepartmentFormDialog — organism dialog tambah/edit departemen.
 * Field form dikontrol penuh oleh container via `form` + `onFieldChange` (§19.5).
 */
export function DepartmentFormDialog({
  open,
  editing,
  form,
  isSaving,
  onFieldChange,
  onClose,
  onSubmit,
}: DepartmentFormDialogProps) {
  const isEdit = Boolean(editing);
  const canSubmit = form.code.trim() !== '' && form.name.trim() !== '';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    void onSubmit();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isSaving) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Departemen' : 'Tambah Departemen'}</DialogTitle>
          <DialogDescription>Lengkapi informasi departemen di bawah ini.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="deptCode" className="text-sm font-medium">
              Kode
            </label>
            <Input
              id="deptCode"
              value={form.code}
              onChange={(e) => onFieldChange('code', e.target.value)}
              placeholder="cth: TEKNIK"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="deptName" className="text-sm font-medium">
              Nama
            </label>
            <Input
              id="deptName"
              value={form.name}
              onChange={(e) => onFieldChange('name', e.target.value)}
              placeholder="cth: Teknik Informatika"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="deptDescription" className="text-sm font-medium">
              Deskripsi
            </label>
            <textarea
              id="deptDescription"
              value={form.description}
              onChange={(e) => onFieldChange('description', e.target.value)}
              placeholder="Deskripsi singkat departemen (opsional)"
              rows={3}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Batal
            </Button>
            <Button type="submit" disabled={isSaving || !canSubmit}>
              {isSaving ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
