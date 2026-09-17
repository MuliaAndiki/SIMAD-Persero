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
import { useState } from 'react';

export type OverrideType = 'CHECK_IN' | 'CHECK_OUT' | 'INVALID';

const TIME_RANGES: Record<
  Exclude<OverrideType, 'INVALID'>,
  { min: string; max: string; default: string }
> = {
  CHECK_IN: { min: '08:00', max: '10:00', default: '08:00' },
  CHECK_OUT: { min: '17:00', max: '19:00', default: '17:00' },
};

export interface OverrideAttendanceModalProps {
  open: boolean;
  isPending: boolean;
  attendanceId: string | null;
  internName?: string;
  onClose: () => void;
  onSubmit: (
    attendanceId: string,
    data: { type: OverrideType; time?: string; reason: string },
  ) => Promise<void>;
}

export function OverrideAttendanceModal({
  open,
  isPending,
  attendanceId,
  internName,
  onClose,
  onSubmit,
}: OverrideAttendanceModalProps) {
  const [type, setType] = useState<OverrideType>('CHECK_IN');
  const [time, setTime] = useState<string>(TIME_RANGES.CHECK_IN.default);
  const [reason, setReason] = useState('');

  const isTimeType = type !== 'INVALID';
  const range = isTimeType ? TIME_RANGES[type as Exclude<OverrideType, 'INVALID'>] : null;

  const handleTypeChange = (val: OverrideType) => {
    setType(val);
    if (val !== 'INVALID') {
      setTime(TIME_RANGES[val as Exclude<OverrideType, 'INVALID'>].default);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendanceId || !reason.trim()) return;
    if (isTimeType && !time) return;
    await onSubmit(attendanceId, {
      type,
      time: isTimeType ? time : undefined,
      reason: reason.trim(),
    });
    setReason('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="size-5 text-primary" />
            Override Status Kehadiran
          </DialogTitle>
          <DialogDescription>
            Ubah absensi secara manual untuk peserta{' '}
            <span className="font-semibold text-foreground">{internName ?? 'Magang'}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="override-type-select" className="text-xs font-medium text-foreground">
              Jenis Override
            </label>
            <Select value={type} onValueChange={(val) => handleTypeChange(val as OverrideType)}>
              <SelectTrigger id="override-type-select">
                <SelectValue placeholder="Pilih Jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CHECK_IN">Check In (Jam Masuk)</SelectItem>
                <SelectItem value="CHECK_OUT">Check Out (Jam Pulang)</SelectItem>
                <SelectItem value="INVALID">Tidak Masuk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isTimeType && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="override-time" className="text-xs font-medium text-foreground">
                Waktu {type === 'CHECK_IN' ? 'Check In' : 'Check Out'}
              </label>
              <Input
                id="override-time"
                type="time"
                min={range?.min}
                max={range?.max}
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Pilih waktu antara {range?.min} - {range?.max} WIB.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="override-reason" className="text-xs font-medium text-foreground">
              Alasan Override
            </label>
            <Input
              id="override-reason"
              type="text"
              placeholder="Contoh: Kendala GPS / Konfirmasi Tugas Luar"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending || !reason.trim() || (isTimeType && !time)}>
              {isPending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
              Simpan Override
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
