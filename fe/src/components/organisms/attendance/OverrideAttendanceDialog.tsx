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
import { Edit3, Loader2 } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';

export type OverrideAttendanceFormField = 'type' | 'time' | 'reason';
export type OverrideAttendanceType = 'CHECK_IN' | 'CHECK_OUT' | 'INVALID';
export type OverrideType = OverrideAttendanceType;

export const TIME_RANGES: Record<
  Exclude<OverrideAttendanceType, 'INVALID'>,
  { min: string; max: string; default: string }
> = {
  CHECK_IN: { min: '08:00', max: '10:00', default: '08:00' },
  CHECK_OUT: { min: '17:00', max: '19:00', default: '17:00' },
};

/** Object state form override */
export interface OverrideAttendanceFormState {
  type: OverrideAttendanceType;
  time: string;
  reason: string;
}

const DEFAULT_FORM: OverrideAttendanceFormState = {
  type: 'CHECK_IN',
  time: TIME_RANGES.CHECK_IN.default,
  reason: '',
};

export interface OverrideAttendanceDialogProps {
  open: boolean;
  onClose: () => void;
  internName?: string;
  attendanceId?: string | null;
  /** State form saat dikontrol parent */
  form?: OverrideAttendanceFormState;
  /** Handler saat form dikontrol parent */
  onFieldChange?: (field: OverrideAttendanceFormField, value: string) => void;
  /** Status pending/submitting */
  isSubmitting?: boolean;
  isPending?: boolean;
  /** Submit handler (mendukung controlled onSubmit maupun modal callback onSubmit) */
  onSubmit?:
    | (() => void | Promise<void>)
    | ((
        attendanceId: string,
        data: { type: OverrideAttendanceType; time?: string; reason: string },
      ) => Promise<void>);
}

/**
 * OverrideAttendanceDialog — organism dialog/modal override status absensi terpadu.
 * Mendukung controlled state (via `form` & `onFieldChange`) maupun autonomous modal state.
 */
export function OverrideAttendanceDialog({
  open,
  onClose,
  internName,
  attendanceId,
  form: controlledForm,
  onFieldChange: controlledFieldChange,
  isSubmitting: isSubmittingProp,
  isPending: isPendingProp,
  onSubmit,
}: OverrideAttendanceDialogProps) {
  const isControlled = Boolean(controlledForm && controlledFieldChange);
  const isSubmitting = Boolean(isSubmittingProp ?? isPendingProp);

  const [internalForm, setInternalForm] = useState<OverrideAttendanceFormState>(DEFAULT_FORM);

  useEffect(() => {
    if (open && !isControlled) {
      setInternalForm(DEFAULT_FORM);
    }
  }, [open, isControlled]);

  const form = isControlled ? controlledForm! : internalForm;

  const handleFieldChange = (field: OverrideAttendanceFormField, value: string) => {
    if (isControlled && controlledFieldChange) {
      controlledFieldChange(field, value);
    } else {
      setInternalForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const isTimeType = form.type !== 'INVALID';
  const range = isTimeType
    ? TIME_RANGES[form.type as Exclude<OverrideAttendanceType, 'INVALID'>]
    : null;

  const handleTypeChange = (value: OverrideAttendanceType) => {
    handleFieldChange('type', value);
    if (value !== 'INVALID') {
      handleFieldChange(
        'time',
        TIME_RANGES[value as Exclude<OverrideAttendanceType, 'INVALID'>].default,
      );
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.reason.trim()) return;
    if (isTimeType && !form.time) return;
    if (!onSubmit) return;

    if (attendanceId !== undefined && onSubmit.length >= 2) {
      if (!attendanceId) return;
      await (
        onSubmit as (
          attendanceId: string,
          data: { type: OverrideAttendanceType; time?: string; reason: string },
        ) => Promise<void>
      )(attendanceId, {
        type: form.type,
        time: isTimeType ? form.time : undefined,
        reason: form.reason.trim(),
      });
      onClose();
    } else {
      await (onSubmit as () => void | Promise<void>)();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="size-5 text-primary" />
            Override Status {internName ? 'Kehadiran' : 'Absensi'}
          </DialogTitle>
          <DialogDescription>
            {internName ? (
              <>
                Ubah absensi secara manual untuk peserta{' '}
                <span className="font-semibold text-foreground">{internName}</span>.
              </>
            ) : (
              'Ubah absensi peserta. Tindakan ini tercatat di log sistem beserta alasan Anda.'
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-1">
          <div className="flex flex-col gap-1.5">
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
                <SelectItem value="INVALID">Tidak Hadir / Tidak Valid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isTimeType && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="overrideTime" className="text-sm font-medium">
                Waktu {form.type === 'CHECK_IN' ? 'Check In' : 'Check Out'}
              </label>
              <Input
                id="overrideTime"
                type="time"
                min={range?.min}
                max={range?.max}
                value={form.time}
                onChange={(e) => handleFieldChange('time', e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Pilih waktu antara {range?.min} - {range?.max} WIB.
              </p>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="overrideReason" className="text-sm font-medium">
              Alasan
            </label>
            <textarea
              id="overrideReason"
              value={form.reason}
              onChange={(e) => handleFieldChange('reason', e.target.value)}
              placeholder="Contoh: Kendala GPS / Konfirmasi Tugas Luar…"
              rows={3}
              required
              className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <DialogFooter className="mt-2 gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !form.reason.trim() || (isTimeType && !form.time)}
            >
              {isSubmitting && <Loader2 className="mr-1.5 size-4 animate-spin" />}
              Simpan Override
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
