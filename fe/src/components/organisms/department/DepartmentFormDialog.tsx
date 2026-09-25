'use client';

import { Input } from '@/components/atoms/input';
import { FormDialogShell } from '@/components/wrapper/FormDialogShell';
import type { DepartmentResponse } from '@/types/api/department.types';

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

  return (
    <FormDialogShell
      open={open}
      title={isEdit ? 'Edit Departemen' : 'Tambah Departemen'}
      description="Lengkapi informasi departemen di bawah ini."
      isEdit={isEdit}
      isSaving={isSaving}
      canSubmit={canSubmit}
      onClose={onClose}
      onSubmit={onSubmit}
    >
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
    </FormDialogShell>
  );
}
