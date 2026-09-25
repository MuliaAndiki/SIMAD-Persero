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
import { Label } from '@/components/atoms/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { Textarea } from '@/components/atoms/textarea';
import { useApi } from '@/hooks/useService/useApi';
import type { AttendanceResponse } from '@/types/api/attendance.types';
import { AttendanceCorrectionType, type AttendanceCorrectionTypeValue } from '@/types/api/correction.types';
import { AlertCircle, FileUp, Loader2, UploadCloud } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface AttendanceCorrectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAttendanceId?: string;
  initialDate?: string;
  records?: AttendanceResponse[];
  onSuccess?: () => void;
}

export function AttendanceCorrectionDialog({
  open,
  onOpenChange,
  initialAttendanceId,
  initialDate,
  records = [],
  onSuccess,
}: AttendanceCorrectionDialogProps) {
  const api = useApi();
  const submitMutation = api.correction.mutate.submit();
  const uploadFileMutation = api.file.mutate.upload();

  const [selectedAttendanceId, setSelectedAttendanceId] = useState<string>(initialAttendanceId ?? '');
  const [correctionType, setCorrectionType] = useState<AttendanceCorrectionTypeValue>(
    AttendanceCorrectionType.BOTH,
  );
  const [requestedCheckIn, setRequestedCheckIn] = useState('07:30');
  const [requestedCheckOut, setRequestedCheckOut] = useState('16:30');
  const [reason, setReason] = useState('');
  const [evidenceFileId, setEvidenceFileId] = useState<string | null>(null);
  const [evidenceFileName, setEvidenceFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Sync initial ID when changed
  React.useEffect(() => {
    if (initialAttendanceId) {
      setSelectedAttendanceId(initialAttendanceId);
    } else if (records.length > 0 && !selectedAttendanceId) {
      setSelectedAttendanceId(records[0].id);
    }
  }, [initialAttendanceId, records, selectedAttendanceId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadFileMutation.mutateAsync(formData);
      const uploadedId = (res as any)?.data?.id ?? (res as any)?.id;
      if (uploadedId) {
        setEvidenceFileId(uploadedId);
        setEvidenceFileName(file.name);
        toast.success('Bukti pendukung berhasil diunggah');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Gagal mengunggah bukti pendukung');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAttendanceId) {
      toast.error('Pilih tanggal absensi yang ingin dikoreksi');
      return;
    }
    if (!reason.trim()) {
      toast.error('Mohon isi alasan pengajuan koreksi');
      return;
    }

    // Determine target attendance record date for formatting timestamps
    const targetRecord = records.find((r) => r.id === selectedAttendanceId);
    const baseDateStr = targetRecord?.attendanceDate
      ? targetRecord.attendanceDate.slice(0, 10)
      : initialDate
        ? initialDate.slice(0, 10)
        : new Date().toISOString().slice(0, 10);

    let checkInIso: string | undefined = undefined;
    let checkOutIso: string | undefined = undefined;

    if (
      correctionType === AttendanceCorrectionType.CHECK_IN ||
      correctionType === AttendanceCorrectionType.BOTH ||
      correctionType === AttendanceCorrectionType.INVALID_OVERRIDE
    ) {
      if (requestedCheckIn) {
        checkInIso = new Date(`${baseDateStr}T${requestedCheckIn}:00`).toISOString();
      }
    }

    if (
      correctionType === AttendanceCorrectionType.CHECK_OUT ||
      correctionType === AttendanceCorrectionType.BOTH ||
      correctionType === AttendanceCorrectionType.INVALID_OVERRIDE
    ) {
      if (requestedCheckOut) {
        checkOutIso = new Date(`${baseDateStr}T${requestedCheckOut}:00`).toISOString();
      }
    }

    try {
      await submitMutation.mutateAsync({
        attendanceId: selectedAttendanceId,
        correctionType,
        requestedCheckIn: checkInIso,
        requestedCheckOut: checkOutIso,
        reason: reason.trim(),
        evidenceFileId: evidenceFileId ?? undefined,
      });

      toast.success('Pengajuan koreksi absensi berhasil dikirim!');
      onOpenChange(false);
      // Reset form
      setReason('');
      setEvidenceFileId(null);
      setEvidenceFileName(null);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message || 'Gagal mengajukan koreksi');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ajukan Koreksi Presensi</DialogTitle>
            <DialogDescription>
              Ajukan permohonan koreksi jam hadir atau status presensi kepada supervisor Anda.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Record / Tanggal Selector */}
            <div className="grid gap-2">
              <Label htmlFor="attendanceRecord">Tanggal Presensi</Label>
              {initialDate && initialAttendanceId ? (
                <Input
                  id="attendanceRecord"
                  value={new Date(initialDate).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                  disabled
                />
              ) : (
                <Select value={selectedAttendanceId} onValueChange={setSelectedAttendanceId}>
                  <SelectTrigger id="attendanceRecord">
                    <SelectValue placeholder="Pilih tanggal absensi" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {records.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {new Date(r.attendanceDate).toLocaleDateString('id-ID', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        — ({r.attendanceStatus ?? 'PENDING'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Tipe Koreksi */}
            <div className="grid gap-2">
              <Label htmlFor="correctionType">Jenis Koreksi</Label>
              <Select
                value={correctionType}
                onValueChange={(val) => setCorrectionType(val as AttendanceCorrectionTypeValue)}
              >
                <SelectTrigger id="correctionType">
                  <SelectValue placeholder="Pilih jenis koreksi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AttendanceCorrectionType.BOTH}>
                    Koreksi Masuk & Pulang
                  </SelectItem>
                  <SelectItem value={AttendanceCorrectionType.CHECK_IN}>
                    Koreksi Jam Masuk Saja
                  </SelectItem>
                  <SelectItem value={AttendanceCorrectionType.CHECK_OUT}>
                    Koreksi Jam Pulang Saja
                  </SelectItem>
                  <SelectItem value={AttendanceCorrectionType.INVALID_OVERRIDE}>
                    Koreksi Presensi Tidak Valid / Alpa
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Requested Times */}
            <div className="grid grid-cols-2 gap-3">
              {(correctionType === AttendanceCorrectionType.CHECK_IN ||
                correctionType === AttendanceCorrectionType.BOTH ||
                correctionType === AttendanceCorrectionType.INVALID_OVERRIDE) && (
                <div className="grid gap-2">
                  <Label htmlFor="requestedCheckIn">Jam Masuk Diminta</Label>
                  <Input
                    id="requestedCheckIn"
                    type="time"
                    value={requestedCheckIn}
                    onChange={(e) => setRequestedCheckIn(e.target.value)}
                    required
                  />
                </div>
              )}

              {(correctionType === AttendanceCorrectionType.CHECK_OUT ||
                correctionType === AttendanceCorrectionType.BOTH ||
                correctionType === AttendanceCorrectionType.INVALID_OVERRIDE) && (
                <div className="grid gap-2">
                  <Label htmlFor="requestedCheckOut">Jam Pulang Diminta</Label>
                  <Input
                    id="requestedCheckOut"
                    type="time"
                    value={requestedCheckOut}
                    onChange={(e) => setRequestedCheckOut(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            {/* Alasan */}
            <div className="grid gap-2">
              <Label htmlFor="reason">Alasan Koreksi</Label>
              <Textarea
                id="reason"
                placeholder="Jelaskan alasan mengapa presensi perlu dikoreksi (misal: kendala GPS, penugasan luar, dsb)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                required
              />
            </div>

            {/* Upload Bukti Pendukung */}
            <div className="grid gap-2">
              <Label htmlFor="evidence">Bukti Pendukung (Opsional)</Label>
              <div className="flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-input bg-muted/30 px-4 py-2 text-sm hover:bg-muted/60 transition">
                  <UploadCloud className="size-4 text-muted-foreground" />
                  <span>{isUploading ? 'Mengunggah...' : 'Pilih File Bukti (Foto/PDF)'}</span>
                  <input
                    id="evidence"
                    type="file"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>
                {evidenceFileName && (
                  <span className="flex items-center gap-1.5 text-xs text-primary font-medium truncate max-w-[200px]">
                    <FileUp className="size-3.5" />
                    {evidenceFileName}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-700 dark:text-amber-400">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <p>
                Pengajuan koreksi akan diteruskan kepada pembimbing lapangan (supervisor) Anda untuk
                ditinjau dan disetujui.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitMutation.isPending || isUploading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={submitMutation.isPending || isUploading || !reason.trim()}
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                'Kirim Pengajuan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
