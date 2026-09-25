'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/atoms/table';
import { Textarea } from '@/components/atoms/textarea';
import type { AttendanceCorrectionItem } from '@/types/api/correction.types';
import { formatDate, formatTime } from '@/utils/string.format';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  User,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';

export interface AttendanceCorrectionSectionProps {
  corrections: AttendanceCorrectionItem[];
  isPending: boolean;
  onApprove: (id: string, notes?: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
}

export function AttendanceCorrectionSection({
  corrections,
  isPending,
  onApprove,
  onReject,
}: AttendanceCorrectionSectionProps) {
  const [selectedCorrection, setSelectedCorrection] = useState<AttendanceCorrectionItem | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleOpenApprove = (item: AttendanceCorrectionItem) => {
    setSelectedCorrection(item);
    setNotes('');
    setApproveModalOpen(true);
  };

  const handleOpenReject = (item: AttendanceCorrectionItem) => {
    setSelectedCorrection(item);
    setNotes('');
    setRejectModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedCorrection) return;
    setIsActionLoading(true);
    try {
      await onApprove(selectedCorrection.id, notes || undefined);
      setApproveModalOpen(false);
      setSelectedCorrection(null);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedCorrection || !notes.trim()) return;
    setIsActionLoading(true);
    try {
      await onReject(selectedCorrection.id, notes.trim());
      setRejectModalOpen(false);
      setSelectedCorrection(null);
    } finally {
      setIsActionLoading(false);
    }
  };

  const pendingCount = corrections.filter((c) => c.status === 'PENDING').length;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          Review Pengajuan Koreksi Absensi
        </h1>
        <p className="text-sm text-muted-foreground">
          Periksa permohonan koreksi jam masuk atau keluar yang diajukan oleh peserta magang bimbingan Anda.
        </p>
      </header>

      {/* Summary card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4 bg-amber-500/5 border-amber-500/20">
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Menunggu Review</p>
            <h3 className="text-2xl font-bold text-foreground">{pendingCount} Pengajuan</h3>
          </div>
        </Card>
      </div>

      {isPending ? (
        <Card className="p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Memuat daftar pengajuan koreksi...</p>
        </Card>
      ) : corrections.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          Tidak ada pengajuan koreksi absensi yang masuk.
        </Card>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Nama Peserta</TableHead>
                <TableHead className="font-semibold">Tanggal Absen</TableHead>
                <TableHead className="font-semibold text-center">Jenis Koreksi</TableHead>
                <TableHead className="font-semibold">Jam yang Diajukan</TableHead>
                <TableHead className="font-semibold">Alasan & Bukti</TableHead>
                <TableHead className="font-semibold text-center">Status</TableHead>
                <TableHead className="font-semibold text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {corrections.map((item) => {
                const isPendingItem = item.status === 'PENDING';
                return (
                  <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-medium text-foreground">
                          {item.intern?.fullName ?? '-'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{formatDate(item.attendance?.attendanceDate ?? item.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-xs font-mono">
                        {item.correctionType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex flex-col">
                        {item.requestedCheckIn && (
                          <span>Masuk: <strong>{formatTime(item.requestedCheckIn)}</strong></span>
                        )}
                        {item.requestedCheckOut && (
                          <span>Keluar: <strong>{formatTime(item.requestedCheckOut)}</strong></span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs max-w-[200px]">
                      <p className="line-clamp-2 text-muted-foreground">{item.reason}</p>
                      {item.evidenceFile?.url && (
                        <a
                          href={item.evidenceFile.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline mt-1 font-medium"
                        >
                          <FileText className="h-3 w-3" />
                          Lihat Bukti Foto
                        </a>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          item.status === 'APPROVED'
                            ? 'default'
                            : item.status === 'REJECTED'
                              ? 'destructive'
                              : 'secondary'
                        }
                        className={item.status === 'APPROVED' ? 'bg-emerald-600' : ''}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {isPendingItem ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10 text-xs h-8"
                            onClick={() => handleOpenReject(item)}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Tolak
                          </Button>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                            onClick={() => handleOpenApprove(item)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Setujui
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Telah diproses</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Approve Modal */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
              Setujui Koreksi Absensi
            </DialogTitle>
            <DialogDescription>
              Menyetujui koreksi akan memperbarui log absensi peserta dengan jam yang diajukan.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              rows={2}
              placeholder="Catatan supervisor (opsional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveModalOpen(false)}>
              Batal
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleConfirmApprove}
              disabled={isActionLoading}
            >
              {isActionLoading ? 'Memproses...' : 'Konfirmasi Setujui'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Tolak Koreksi Absensi
            </DialogTitle>
            <DialogDescription>
              Tuliskan alasan penolakan permohonan koreksi absensi ini.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              rows={3}
              placeholder="Contoh: Bukti foto tidak sesuai dengan tanggal atau lokasi absensi..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={!notes.trim() || isActionLoading}
            >
              {isActionLoading ? 'Memproses...' : 'Konfirmasi Tolak'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
