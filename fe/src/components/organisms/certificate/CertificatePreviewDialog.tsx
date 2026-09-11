'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Award, ExternalLink, Eye, FileText, QrCode } from 'lucide-react';
import Image from 'next/image';

export interface CertificatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signerName: string;
  signerRole: string;
  signatureUrl?: string;
  templateUrl?: string;
  templateFileName?: string;
}

export function CertificatePreviewDialog({
  open,
  onOpenChange,
  signerName,
  signerRole,
  signatureUrl,
  templateUrl,
  templateFileName,
}: CertificatePreviewDialogProps) {
  const isPdf = templateUrl?.toLowerCase().includes('.pdf');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-1 text-left border-b pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Award className="size-5 text-primary" />
              <DialogTitle className="text-xl font-bold">Pratinjau Sertifikat Magang</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Mode Pratinjau
              </Badge>
              {templateFileName ? (
                <Badge variant="outline" className="text-xs max-w-[200px] truncate">
                  {templateFileName}
                </Badge>
              ) : (
                <Badge variant="default" className="text-xs">
                  Template Default PLN
                </Badge>
              )}
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Simulasi sertifikat yang akan digenerate otomatis dan diunduh oleh peserta magang.
          </DialogDescription>
        </DialogHeader>

        {/* Preview Body */}
        <div className="my-2">
          {isPdf && templateUrl ? (
            <div className="w-full overflow-hidden rounded-xl border border-border bg-muted/10 shadow-inner">
              <iframe
                src={templateUrl}
                className="h-[520px] w-full border-0"
                title="Pratinjau Template Sertifikat PDF"
              />
            </div>
          ) : (
            /* Landscape Certificate Design Simulation */
            <div className="relative w-full overflow-hidden rounded-xl border-4 border-amber-600/30 bg-gradient-to-br from-amber-50/60 via-white to-sky-50/40 p-6 sm:p-10 shadow-lg text-foreground dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 dark:border-amber-500/30">
              {/* Corner Ornaments */}
              <div className="absolute top-2 left-2 size-8 border-t-2 border-l-2 border-amber-600/60 dark:border-amber-400/60" />
              <div className="absolute top-2 right-2 size-8 border-t-2 border-r-2 border-amber-600/60 dark:border-amber-400/60" />
              <div className="absolute bottom-2 left-2 size-8 border-b-2 border-l-2 border-amber-600/60 dark:border-amber-400/60" />
              <div className="absolute bottom-2 right-2 size-8 border-b-2 border-r-2 border-amber-600/60 dark:border-amber-400/60" />

              {/* Watermark Logo Background */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-5">
                <Image src="/images/logos.png" alt="PLN Watermark" width={320} height={320} />
              </div>

              {/* Header */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="mb-2">
                  <Image
                    src="/images/logos.png"
                    alt="Logo PLN"
                    width={64}
                    height={64}
                    className="h-14 w-auto object-contain"
                  />
                </div>
                <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  PT PLN (PERSERO)
                </h3>
                <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-wider text-primary font-serif uppercase">
                  SERTIFIKAT KELULUSAN
                </h2>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  Nomor: SIMAD/CERT/2026/09/00812
                </p>
              </div>

              {/* Recipient Content */}
              <div className="relative z-10 my-6 text-center space-y-2">
                <p className="text-xs text-muted-foreground italic">Diberikan kepada:</p>
                <h4 className="text-xl sm:text-2xl font-bold text-foreground font-serif tracking-wide border-b-2 border-amber-500/40 inline-block px-8 pb-1">
                  AHMAD FAUZI, S.Kom
                </h4>
                <p className="text-xs font-medium text-foreground/80">
                  NIM: 2022010892 • Universitas Indonesia (Teknik Informatika)
                </p>
                <p className="max-w-xl mx-auto text-xs sm:text-sm text-muted-foreground pt-2 leading-relaxed">
                  Telah menyelesaikan Program Praktik Kerja Lapangan / Magang di PT PLN (Persero)
                  dengan predikat{' '}
                  <strong className="text-primary font-semibold">SANGAT MEMUASKAN</strong> terhitung
                  sejak tanggal 01 Februari 2026 sampai dengan 31 Juli 2026.
                </p>
              </div>

              {/* Signatures & Verification Footer */}
              <div className="relative z-10 mt-8 grid grid-cols-2 items-end pt-4 border-t border-border/40">
                {/* Left: QR Code Verification */}
                <div className="flex items-center gap-3">
                  <div className="size-16 rounded-lg border border-border/80 bg-white p-1.5 shadow-sm flex items-center justify-center">
                    <QrCode className="size-12 text-slate-800" />
                  </div>
                  <div className="text-left text-[11px] leading-tight text-muted-foreground">
                    <p className="font-semibold text-foreground">Verifikasi Digital</p>
                    <p className="text-[10px] text-muted-foreground">
                      Pindai QR code untuk mengecek keaslian sertifikat SIMAD
                    </p>
                    <p className="font-mono text-[9px] text-primary/80 mt-0.5">
                      ID: VF-8823-PLN-2026
                    </p>
                  </div>
                </div>

                {/* Right: Signer */}
                <div className="flex flex-col items-center text-center">
                  <p className="text-xs text-muted-foreground">Jakarta, 11 September 2026</p>
                  <p className="text-xs font-medium text-foreground mt-0.5">
                    {signerRole || 'Manager SDM'}
                  </p>

                  <div className="h-16 flex items-center justify-center my-1 min-w-[140px]">
                    {signatureUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={signatureUrl}
                        alt="Tanda Tangan"
                        className="max-h-14 max-w-[150px] object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center border-b border-dashed border-muted-foreground/40 px-6 py-2">
                        <span className="text-[10px] text-muted-foreground italic">
                          (Tanda tangan digital)
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs font-bold text-foreground underline underline-offset-4">
                    {signerName || 'Budi Santoso, S.T., M.T.'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">NIP. 197804122002121001</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t pt-3">
          <p className="text-xs text-muted-foreground">
            {templateUrl
              ? 'Menggunakan template kustom dari Cloudflare R2'
              : 'Menggunakan template bawaan resmi PLN'}
          </p>
          <div className="flex items-center gap-2">
            {templateUrl && (
              <Button asChild variant="outline" size="sm">
                <a
                  href={templateUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5"
                >
                  <ExternalLink className="size-3.5" />
                  Buka File Template
                </a>
              </Button>
            )}
            <Button onClick={() => onOpenChange(false)} size="sm">
              Tutup
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
