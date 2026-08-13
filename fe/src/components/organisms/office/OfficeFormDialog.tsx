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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import type { DepartmentResponse } from '@/types/api/department.types';
import type { OfficeResponse } from '@/types/api/office.types';
import type { FormEvent } from 'react';

export type OfficeFormField =
  | 'name'
  | 'address'
  | 'departmentId'
  | 'latitude'
  | 'longitude'
  | 'radiusMeter';

/** Object state form kantor — dimiliki container (§19.4). Koordinat disimpan string. */
export interface OfficeFormState {
  name: string;
  address: string;
  departmentId: string;
  latitude: string;
  longitude: string;
  radiusMeter: string;
}

export interface OfficeFormDialogProps {
  open: boolean;
  editing: OfficeResponse | null;
  form: OfficeFormState;
  departments: DepartmentResponse[];
  isSaving: boolean;
  onFieldChange: (field: OfficeFormField, value: string) => void;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
}

/**
 * OfficeFormDialog — organism dialog tambah/edit kantor.
 * Field form dikontrol penuh oleh container via `form` + `onFieldChange` (§19.5).
 */
export function OfficeFormDialog({
  open,
  editing,
  form,
  departments,
  isSaving,
  onFieldChange,
  onClose,
  onSubmit,
}: OfficeFormDialogProps) {
  const isEdit = Boolean(editing);
  const canSubmit =
    form.name.trim() !== '' &&
    form.address.trim() !== '' &&
    form.departmentId !== '' &&
    form.latitude !== '' &&
    form.longitude !== '' &&
    form.radiusMeter !== '';

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
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Kantor' : 'Tambah Kantor'}</DialogTitle>
          <DialogDescription>
            Lengkapi informasi lokasi kantor dan koordinat absensi.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="officeName" className="text-sm font-medium">
              Nama Kantor
            </label>
            <Input
              id="officeName"
              value={form.name}
              onChange={(e) => onFieldChange('name', e.target.value)}
              placeholder="cth: Kantor Pusat Bandung"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="officeDepartment" className="text-sm font-medium">
              Departemen
            </label>
            <Select
              value={form.departmentId}
              onValueChange={(v) => onFieldChange('departmentId', v)}
            >
              <SelectTrigger id="officeDepartment">
                <SelectValue placeholder="Pilih departemen" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="officeAddress" className="text-sm font-medium">
              Alamat
            </label>
            <textarea
              id="officeAddress"
              value={form.address}
              onChange={(e) => onFieldChange('address', e.target.value)}
              placeholder="Alamat lengkap kantor"
              rows={3}
              required
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="officeLatitude" className="text-sm font-medium">
                Latitude
              </label>
              <Input
                id="officeLatitude"
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => onFieldChange('latitude', e.target.value)}
                placeholder="cth: -6.9175"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="officeLongitude" className="text-sm font-medium">
                Longitude
              </label>
              <Input
                id="officeLongitude"
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => onFieldChange('longitude', e.target.value)}
                placeholder="cth: 107.6191"
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="officeRadius" className="text-sm font-medium">
              Radius Absensi (meter)
            </label>
            <Input
              id="officeRadius"
              type="number"
              min={1}
              value={form.radiusMeter}
              onChange={(e) => onFieldChange('radiusMeter', e.target.value)}
              placeholder="cth: 100"
              required
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
