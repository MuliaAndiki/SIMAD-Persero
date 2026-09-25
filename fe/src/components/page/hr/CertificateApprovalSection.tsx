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
import type { CertificateResponse } from '@/types/api/certificate.types';
import { formatDate } from '@/utils/string.format';
import {
  AlertCircle,
  Award,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Loader2,
  User,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';

export interface CertificateApprovalSectionProps {
  state: {
    isPending: boolean;
    isError: boolean;
    errorMessage?: string;
    certificates: any[];
    isApproving: boolean;
    isRejecting: boolean;
  };
  actions: {
    onApprove: (id: string) => Promise<void>;
    onReject: (id: string, reason: string) => Promise<void>;
  };
}

export function CertificateApprovalSection({ state, actions }: CertificateApprovalSectionProps) {
  const [selectedCert, setSelectedCert] = useState<any | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleOpenReject = (cert: any) => {
    setSelectedCert(cert);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedCert || !rejectionReason.trim()) return;
    await actions.onReject(selectedCert.id, rejectionReason.trim());
    setRejectModalOpen(false);
    setSelectedCert(null);
  };

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Award className="h-6 w-6 text-primary" />
          Persetujuan & Penerbitan Sertifikat Magang
        </h1>
        <p className="text-sm text-muted-foreground">
          Tinjau penilaian akhir supervisor sebelum menyetujui dan menerbitkan sertifikat resmi bertanda tangan digital.
        </p>
      </header>

      {/* Summary info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4 bg-amber-500/5 border-amber-500/20">
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Menunggu Persetujuan</p>
            <h3 className="text-2xl font-bold text-foreground">{state.certificates.length} Sertifikat</h3>
          </div>
        </Card>
      </div>

      {state.isPending ? (
        <Card className="p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Memuat daftar sertifikat pending...</p>
        </Card>
      ) : state.isError ? (
        <Card className="p-8 border-destructive/30 bg-destructive/5 text-destructive flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Gagal memuat sertifikat</h4>
            <p className="text-xs text-destructive/80 mt-0.5">
              {state.errorMessage ?? 'Terjadi kesalahan saat memuat data.'}
            </p>
          </div>
        </Card>
      ) : state.certificates.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center">
          <Award className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <h3 className="text-base font-semibold text-foreground">Tidak Ada Antrean Persetujuan</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            Seluruh peserta yang selesai magang telah diproses, atau supervisor belum memfinalisasi penilaian.
          </p>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Peserta Magang</TableHead>
                <TableHead className="font-semibold">Unit Kantor & Bidang</TableHead>
                <TableHead className="font-semibold text-center">Nilai Akhir (SPV)</TableHead>
                <TableHead className="font-semibold text-center">Huruf Mutu</TableHead>
                <TableHead className="font-semibold">Supervisor</TableHead>
                <TableHead className="font-semibold text-right">Aksi Persetujuan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.certificates.map((cert) => {
                const internUser = cert.internship?.internProfile?.user;
                const evaluation = cert.internship?.evaluation;
                return (
                  <TableRow key={cert.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-primary" />
                          {internUser?.fullName ?? cert.recipientName ?? '-'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {internUser?.email} • {cert.internship?.internProfile?.studentNumber ?? ''}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {cert.internship?.department?.name ?? '-'}
                        </span>
                        <span>{cert.internship?.officeLocation?.name ?? '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-mono font-bold text-sm">
                        {evaluation?.finalScore ?? '-'} / 100
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="default"
                        className={
                          evaluation?.grade === 'A'
                            ? 'bg-emerald-600'
                            : evaluation?.grade === 'B'
                              ? 'bg-blue-600'
                              : 'bg-amber-600'
                        }
                      >
                        Grade {evaluation?.grade ?? '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-foreground">
                        {evaluation?.supervisor?.fullName ?? cert.internship?.supervisor?.user?.fullName ?? '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10 border-destructive/30 text-xs h-8"
                          onClick={() => handleOpenReject(cert)}
                          disabled={state.isApproving || state.isRejecting}
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Tolak
                        </Button>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                          onClick={() => actions.onApprove(cert.id)}
                          disabled={state.isApproving || state.isRejecting}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Setujui & Terbitkan
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Tolak Penerbitan Sertifikat
            </DialogTitle>
            <DialogDescription>
              Tuliskan alasan penolakan atau revisi yang harus diperbaiki oleh supervisor/peserta.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              rows={3}
              placeholder="Contoh: Nilai belum lengkap atau periode magang belum mencapai durasi minimum..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={!rejectionReason.trim() || state.isRejecting}
            >
              {state.isRejecting ? 'Menolak...' : 'Konfirmasi Tolak'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
