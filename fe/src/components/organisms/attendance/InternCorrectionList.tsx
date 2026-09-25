'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { PhantomSkeleton } from '@/components/atoms/PhantomSkeleton';
import { useApi } from '@/hooks/useService/useApi';
import type { AttendanceCorrectionItem } from '@/types/api/correction.types';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface InternCorrectionListProps {
  corrections: AttendanceCorrectionItem[];
  isLoading?: boolean;
  onOpenNewCorrection?: () => void;
}

export function InternCorrectionList({
  corrections,
  isLoading,
  onOpenNewCorrection,
}: InternCorrectionListProps) {
  const api = useApi();
  const cancelMutation = api.correction.mutate.cancel();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan pengajuan koreksi ini?')) {
      return;
    }

    try {
      setCancellingId(id);
      await cancelMutation.mutateAsync(id);
      toast.success('Pengajuan koreksi berhasil dibatalkan');
    } catch (err: any) {
      toast.error(err?.message || 'Gagal membatalkan pengajuan koreksi');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <CheckCircle2 className="mr-1 size-3" /> Disetujui
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 size-3" /> Ditolak
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Dibatalkan
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            <Clock className="mr-1 size-3" /> Menunggu Review
          </Badge>
        );
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'CHECK_IN':
        return 'Koreksi Masuk';
      case 'CHECK_OUT':
        return 'Koreksi Pulang';
      case 'BOTH':
        return 'Koreksi Masuk & Pulang';
      case 'INVALID_OVERRIDE':
        return 'Koreksi Presensi Alpa / Invalid';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <PhantomSkeleton loading>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 rounded-xl bg-muted" />
          ))}
        </div>
      </PhantomSkeleton>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            Daftar Pengajuan Koreksi Presensi
          </CardTitle>
          <CardDescription>
            Riwayat permohonan koreksi kehadiran Anda beserta status persetujuan supervisor.
          </CardDescription>
        </div>
        {onOpenNewCorrection && (
          <Button size="sm" onClick={onOpenNewCorrection}>
            + Ajukan Koreksi
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {corrections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Calendar className="size-10 text-muted-foreground/50 mb-2" />
            <p className="font-medium text-muted-foreground">Belum ada pengajuan koreksi presensi</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Jika Anda mengalami kendala saat absen atau salah jam, Anda dapat mengajukan koreksi kepada supervisor.
            </p>
            {onOpenNewCorrection && (
              <Button variant="outline" size="sm" className="mt-4" onClick={onOpenNewCorrection}>
                Ajukan Koreksi Sekarang
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {corrections.map((item) => (
              <div
                key={item.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm">
                      {item.attendance?.attendanceDate
                        ? new Date(item.attendance.attendanceDate).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Tanggal Presensi'}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {getTypeText(item.correctionType)}
                    </Badge>
                    {getStatusBadge(item.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {item.requestedCheckIn && (
                      <span>
                        Masuk Diminta:{' '}
                        <strong className="text-foreground">
                          {new Date(item.requestedCheckIn).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </strong>
                      </span>
                    )}
                    {item.requestedCheckOut && (
                      <span>
                        Pulang Diminta:{' '}
                        <strong className="text-foreground">
                          {new Date(item.requestedCheckOut).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </strong>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground italic bg-muted/40 p-2 rounded mt-1">
                    &quot;{item.reason}&quot;
                  </p>

                  {item.supervisorNotes && (
                    <div className="flex items-start gap-1.5 text-xs text-primary font-medium mt-1">
                      <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                      <span>
                        Catatan Supervisor: {item.supervisorNotes}
                        {item.reviewedBy ? ` (oleh ${item.reviewedBy.fullName})` : ''}
                      </span>
                    </div>
                  )}

                  {item.evidenceFile && (
                    <a
                      href={item.evidenceFile.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                    >
                      <ExternalLink className="size-3" />
                      Lihat Bukti Pendukung ({item.evidenceFile.originalName})
                    </a>
                  )}
                </div>

                {item.status === 'PENDING' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleCancel(item.id)}
                      disabled={cancellingId === item.id}
                    >
                      {cancellingId === item.id ? (
                        <Loader2 className="size-3 animate-spin mr-1" />
                      ) : null}
                      Batalkan
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
