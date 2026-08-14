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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import type { FormEvent } from 'react';

export type OverrideAttendanceFormField = 'status' | 'reason';

export type OverrideAttendanceStatus = 'PRESENT' | 'INVALID';

/** Object state form override — dimiliki container (§19.4). */
export interface OverrideAttendanceFormState {
  status: OverrideAttendanceStatus;
  reason: string;
}

export interface OverrideAttendanceDialogProps {
  open: boolean;
  form: OverrideAttendanceFormState;
  isSubmitting: boolean;
  onFieldChange: (field: OverrideAttendanceFormField, value: string) => void;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
}

/**
 * OverrideAttendanceDialog — organism dialog override status absensi.
 * Field dikontrol penuh container via `form` + `onFieldChange` (§19.5).
 */
export function OverrideAttendanceDialog({
  open,
  form,
  isSubmitting,
  onFieldChange,
  onClose,
  onSubmit,
}: OverrideAttendanceDialogProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.reason.trim()) return;
    void onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Override Status Absensi</DialogTitle>
          <DialogDescription>
            Ubah status absensi peserta. Tindakan ini tercatat di log sistem beserta alasan Anda.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="overrideStatus" className="text-sm font-medium">
              Status Baru
            </label>
            <Select value={form.status} onValueChange={(value) => onFieldChange('status', value)}>
              <SelectTrigger id="overrideStatus">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRESENT">Hadir (PRESENT)</SelectItem>
                <SelectItem value="INVALID">Tidak Valid (INVALID)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="overrideReason" className="text-sm font-medium">
              Alasan
            </label>
            <textarea
              id="overrideReason"
              value={form.reason}
              onChange={(e) => onFieldChange('reason', e.target.value)}
              placeholder="Jelaskan alasan override…"
              rows={4}
              className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || !form.reason.trim()}>
              {isSubmitting ? 'Menyimpan…' : 'Simpan Override'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
