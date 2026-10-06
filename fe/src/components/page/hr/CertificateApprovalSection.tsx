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
import { TableLoader } from '@/components/atoms/loading';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/table';
import { Textarea } from '@/components/atoms/textarea';
import { RowActionsMenu } from '@/components/organisms/table/RowActionsMenu';
import { TableEmptyState } from '@/components/organisms/table/TableEmptyState';
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
          Tinjau penilaian akhir supervisor sebelum menyetujui dan menerbitkan sertifikat resmi
          bertanda tangan digital.
        </p>
      </header>

      {/* High-Density Summary info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="flex flex-col justify-between p-3.5 border-border/70 hover:border-border shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">Menunggu Persetujuan</span>
            <div className="flex size-6.5 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="size-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
                {state.certificates.length}
              </span>
              <span className="text-xs text-muted-foreground">Sertifikat</span>
            </div>
            {state.certificates.length > 0 ? (
              <Badge
                variant="outline"
                className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] px-1.5 py-0"
              >
                Antrean Aktif
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] text-muted-foreground px-1.5 py-0">
                Antrean Bersih
              </Badge>
            )}
          </div>
        </Card>
      </div>

      {state.isPending ? (
        <Card>
          <TableLoader label="Memuat daftar sertifikat pending..." />
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
        <Card>
          <TableEmptyState
            icon={Award}
            title="Tidak Ada Antrean Persetujuan"
            message="Seluruh peserta yang selesai magang telah diproses, atau supervisor belum memfinalisasi penilaian."
          />
        </Card>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Peserta Magang</TableHead>
                <TableHead className="font-semibold">Unit Kantor & Bidang</TableHead>
                <TableHead className="font-semibold text-center">Nilai Akhir (Mentor)</TableHead>
                <TableHead className="font-semibold text-center">Huruf Mutu</TableHead>
                <TableHead className="font-semibold">Mentor</TableHead>
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
                          {internUser?.email} •{' '}
                          {cert.internship?.internProfile?.studentNumber ?? ''}
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
                        {evaluation?.supervisor?.fullName ??
                          cert.internship?.supervisor?.user?.fullName ??
                          '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <RowActionsMenu
                        items={[
                          {
                            key: 'approve',
                            label: 'Setujui & Terbitkan',
                            icon: CheckCircle2,
                            disabled: state.isApproving || state.isRejecting,
                            onSelect: () => {
                              void actions.onApprove(cert.id);
                            },
                          },
                          {
                            key: 'reject',
                            label: 'Tolak',
                            icon: XCircle,
                            variant: 'destructive',
                            disabled: state.isApproving || state.isRejecting,
                            onSelect: () => handleOpenReject(cert),
                          },
                        ]}
                      />
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
