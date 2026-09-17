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
import type { FormEvent } from 'react';

export type OverrideAttendanceFormField = 'type' | 'time' | 'reason';

export type OverrideAttendanceType = 'CHECK_IN' | 'CHECK_OUT' | 'INVALID';

const TIME_RANGES: Record<
  Exclude<OverrideAttendanceType, 'INVALID'>,
  { min: string; max: string; default: string }
> = {
  CHECK_IN: { min: '08:00', max: '10:00', default: '08:00' },
  CHECK_OUT: { min: '17:00', max: '19:00', default: '17:00' },
};

/** Object state form override — dimiliki container (§19.4). */
export interface OverrideAttendanceFormState {
  type: OverrideAttendanceType;
  time: string;
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
  const isTimeType = form.type !== 'INVALID';
  const range = isTimeType
    ? TIME_RANGES[form.type as Exclude<OverrideAttendanceType, 'INVALID'>]
    : null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.reason.trim()) return;
    if (isTimeType && !form.time) return;
    void onSubmit();
  };

  const handleTypeChange = (value: OverrideAttendanceType) => {
    onFieldChange('type', value);
    if (value !== 'INVALID') {
      onFieldChange(
        'time',
        TIME_RANGES[value as Exclude<OverrideAttendanceType, 'INVALID'>].default,
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Override Status Absensi</DialogTitle>
          <DialogDescription>
            Ubah absensi peserta. Tindakan ini tercatat di log sistem beserta alasan Anda.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="overrideType" className="text-sm font-medium">
              Jenis Override
            </label>
            <Select
              value={form.type}
              onValueChange={(value) => handleTypeChange(value as OverrideAttendanceType)}
            >
              <SelectTrigger id="overrideType">
                <SelectValue placeholder="Pilih jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CHECK_IN">Check In (Jam Masuk)</SelectItem>
                <SelectItem value="CHECK_OUT">Check Out (Jam Pulang)</SelectItem>
                <SelectItem value="INVALID">Tidak Valid / Curang</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isTimeType && (
            <div className="flex flex-col gap-2">
              <label htmlFor="overrideTime" className="text-sm font-medium">
                Waktu {form.type === 'CHECK_IN' ? 'Check In' : 'Check Out'}
              </label>
              <Input
                id="overrideTime"
                type="time"
                min={range?.min}
                max={range?.max}
                value={form.time}
                onChange={(e) => onFieldChange('time', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Pilih waktu antara {range?.min} - {range?.max} WIB.
              </p>
            </div>
          )}
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
            <Button
              type="submit"
              disabled={isSubmitting || !form.reason.trim() || (isTimeType && !form.time)}
            >
              {isSubmitting ? 'Menyimpan…' : 'Simpan Override'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
