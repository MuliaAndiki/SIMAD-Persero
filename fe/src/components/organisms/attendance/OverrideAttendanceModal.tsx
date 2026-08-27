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

export interface OverrideAttendanceModalProps {
  open: boolean;
  isPending: boolean;
  attendanceId: string | null;
  internName?: string;
  onClose: () => void;
  onSubmit: (
    attendanceId: string,
    data: { status: 'PRESENT' | 'INVALID'; reason: string },
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
  const [status, setStatus] = useState<'PRESENT' | 'INVALID'>('PRESENT');
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendanceId || !reason.trim()) return;
    await onSubmit(attendanceId, { status, reason: reason.trim() });
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
            Ubah status absensi secara manual untuk peserta{' '}
            <span className="font-semibold text-foreground">{internName ?? 'Magang'}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="override-status-select" className="text-xs font-medium text-foreground">
              Status Baru
            </label>
            <Select value={status} onValueChange={(val) => setStatus(val as 'PRESENT' | 'INVALID')}>
              <SelectTrigger id="override-status-select">
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRESENT">Hadir (PRESENT)</SelectItem>
                <SelectItem value="INVALID">Tidak Valid (INVALID)</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
            <Button type="submit" disabled={isPending || !reason.trim()}>
              {isPending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
              Simpan Override
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
