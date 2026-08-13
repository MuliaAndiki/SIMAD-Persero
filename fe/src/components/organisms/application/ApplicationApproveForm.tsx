'use client';

import { Button } from '@/components/atoms/button';
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
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
import type { FormEvent } from 'react';

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
 * Field dikontrol penuh container via `form` + `onFieldChange` (§19.5).
 */
export function ApplicationApproveForm({
  departments,
  offices,
  supervisors,
  form,
  isSubmitting,
  onFieldChange,
  onBack,
  onSubmit,
}: ApplicationApproveFormProps) {
  const filteredOffices = offices.filter(
    (office) => !form.departmentId || office.departmentId === form.departmentId,
  );

  const canSubmit = Boolean(form.departmentId && form.supervisorId);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    void onSubmit();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Setujui Pengajuan</DialogTitle>
        <DialogDescription>
          Tentukan departemen, kantor, dan supervisor untuk peserta magang.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">Departemen *</span>
          <Select value={form.departmentId} onValueChange={(v) => onFieldChange('departmentId', v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih departemen" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">Kantor</span>
          <Select
            value={form.officeLocationId}
            onValueChange={(v) => onFieldChange('officeLocationId', v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih kantor (opsional)" />
            </SelectTrigger>
            <SelectContent>
              {filteredOffices.map((office) => (
                <SelectItem key={office.id} value={office.id}>
                  {office.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!form.departmentId && (
            <p className="text-xs text-muted-foreground">
              Pilih departemen terlebih dahulu untuk memfilter kantor.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">Supervisor *</span>
          <Select value={form.supervisorId} onValueChange={(v) => onFieldChange('supervisorId', v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih supervisor" />
            </SelectTrigger>
            <SelectContent>
              {supervisors.map((sup) => (
                <SelectItem key={sup.id} value={sup.id}>
                  {sup.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">Catatan</span>
          <textarea
            value={form.notes}
            onChange={(e) => onFieldChange('notes', e.target.value)}
            rows={3}
            placeholder="Catatan tambahan (opsional)…"
            className="border-input placeholder:text-muted-foreground flex min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          />
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
            Kembali
          </Button>
          <Button type="submit" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? 'Menyetujui…' : 'Setujui Pengajuan'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
