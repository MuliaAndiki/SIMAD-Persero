'use client';

import { Badge } from '@/components/atoms/badge';
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
import { Label } from '@/components/atoms/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { Textarea } from '@/components/atoms/textarea';
import type { DepartmentResponse } from '@/types/api/department.types';
import type { OfficeResponse } from '@/types/api/office.types';
import type { DepartmentAllocationInput, QuotaItem } from '@/types/api/quota.types';
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  HelpCircle,
  MapPin,
  Sparkles,
  Users,
} from 'lucide-react';
import React, { useMemo } from 'react';

export interface QuotaFormState {
  officeLocationId: string;
  totalCapacity: number;
  notes: string;
  isActive: boolean;
  allocations: DepartmentAllocationInput[];
}

export type QuotaFormField = keyof QuotaFormState;

interface QuotaFormDialogProps {
  open: boolean;
  editing: QuotaItem | null;
  form: QuotaFormState;
  offices: OfficeResponse[];
  departments: DepartmentResponse[];
  isSaving: boolean;
  onClose: () => void;
  onFieldChange: (field: QuotaFormField, value: any) => void;
  onAllocationChange: (departmentId: string, capacity: number) => void;
  onDistributeEvenly?: () => void;
  onSubmit: () => void;
}

export function QuotaFormDialog({
  open,
  editing,
  form,
  offices,
  departments,
  isSaving,
  onClose,
  onFieldChange,
  onAllocationChange,
  onDistributeEvenly,
  onSubmit,
}: QuotaFormDialogProps) {
  const isEdit = Boolean(editing);

  const totalAllocated = useMemo(() => {
    return (form.allocations || []).reduce((sum, a) => sum + (Number(a.capacity) || 0), 0);
  }, [form.allocations]);

  const totalCap = Number(form.totalCapacity) || 0;
  const remainingSlots = totalCap - totalAllocated;
  const isOverAllocated = totalAllocated > totalCap;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {isEdit ? 'Ubah Kuota Magang Kantor' : 'Tambah Kuota Magang Kantor'}
          </DialogTitle>
          <DialogDescription>
            Tentukan total kapasitas kuota penerimaan magang pada kantor ini dan alokasikan pembagian slot ke
            setiap divisi/departemen terkait. Ketersediaan slot akan dihitung otomatis saat peserta aktif masuk dan keluar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-3">
          {/* Kantor */}
          <div className="grid gap-1.5">
            <Label htmlFor="officeLocationId" className="flex items-center gap-1.5 text-sm font-medium">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Lokasi Kantor / Unit PLN <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.officeLocationId}
              onValueChange={(val) => onFieldChange('officeLocationId', val)}
              disabled={isEdit}
            >
              <SelectTrigger id="officeLocationId">
                <SelectValue placeholder="Pilih Unit / Kantor PLN" />
              </SelectTrigger>
              <SelectContent>
                {offices.map((office) => (
                  <SelectItem key={office.id} value={office.id}>
                    {office.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Total Kapasitas Kuota Kantor */}
          <div className="grid gap-1.5 rounded-xl border bg-primary/5 p-3.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="totalCapacity" className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                <Users className="h-4 w-4" />
                Total Kapasitas Kuota Kantor <span className="text-destructive">*</span>
              </Label>
              <span className="text-xs text-muted-foreground">Kapasitas master seluruh divisi</span>
            </div>
            <Input
              id="totalCapacity"
              type="number"
              min="1"
              max="1000"
              placeholder="Contoh: 30"
              className="bg-background text-base font-semibold"
              value={form.totalCapacity || ''}
              onChange={(e) => onFieldChange('totalCapacity', Number(e.target.value))}
            />
          </div>

          {/* Embedded Section: Alokasi Kuota per Departemen */}
          <div className="grid gap-2.5 rounded-xl border p-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2.5">
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-1.5">
                  <Building2 className="size-4 text-primary" />
                  Alokasi Kuota per Departemen / Bidang
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bagi total kuota kantor ({totalCap} slot) ke masing-masing bidang.
                </p>
              </div>

              {onDistributeEvenly && departments.length > 0 && totalCap > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onDistributeEvenly}
                  className="text-xs h-7 gap-1"
                >
                  <Sparkles className="size-3" />
                  Bagi Merata
                </Button>
              )}
            </div>

            {/* Allocation summary status */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/50 p-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span>Teralokasi: <strong>{totalAllocated}</strong> / {totalCap}</span>
                {isOverAllocated ? (
                  <Badge variant="destructive" className="text-[10px] gap-1 px-1.5 py-0">
                    <AlertCircle className="size-3" /> Melebihi Kuota ({totalAllocated - totalCap})
                  </Badge>
                ) : remainingSlots === 0 && totalCap > 0 ? (
                  <Badge variant="default" className="bg-emerald-600 text-[10px] gap-1 px-1.5 py-0">
                    <CheckCircle2 className="size-3" /> Teralokasi Penuh
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    Sisa: {remainingSlots} slot
                  </Badge>
                )}
              </div>
            </div>

            {/* Department input list */}
            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
              {departments.map((dept) => {
                const currentAlloc = form.allocations?.find((a) => a.departmentId === dept.id);
                const currentVal = currentAlloc ? currentAlloc.capacity : 0;

                return (
                  <div
                    key={dept.id}
                    className="flex items-center justify-between gap-3 rounded-lg border p-2.5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate">{dept.name}</span>
                      <span className="text-xs text-muted-foreground">{dept.code}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Label htmlFor={`alloc-${dept.id}`} className="text-xs text-muted-foreground">
                        Slot:
                      </Label>
                      <Input
                        id={`alloc-${dept.id}`}
                        type="number"
                        min="0"
                        max={totalCap}
                        value={currentVal || ''}
                        placeholder="0"
                        className="w-20 h-8 text-center text-sm font-semibold"
                        onChange={(e) => onAllocationChange(dept.id, Number(e.target.value))}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Catatan */}
          <div className="grid gap-1.5">
            <Label htmlFor="notes" className="text-sm font-medium">
              Catatan / Keterangan (Opsional)
            </Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder="Catatan persyaratan khusus atau informasi kantor..."
              value={form.notes}
              onChange={(e) => onFieldChange('notes', e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Batal
          </Button>
          <Button
            onClick={onSubmit}
            disabled={
              isSaving ||
              !form.officeLocationId ||
              !form.totalCapacity ||
              isOverAllocated
            }
          >
            {isSaving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Kuota'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
