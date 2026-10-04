'use client';

import { Button } from '@/components/atoms/button';
import { useApi } from '@/hooks/useService/useApi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  AlertCircle,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Download,
  GraduationCap,
  Loader2,
  QrCode,
  Search,
  ShieldCheck,
  User,
  XCircle,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { AcademicNote, ScribbleArrow, ScribbleCircle } from './primitives';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function CertificateVerificationSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inputCode, setInputCode] = useState('');
  const [searchedCode, setSearchedCode] = useState('');

  const api = useApi();
  const verifyQuery = api.certificate.query.verify(
    { verificationCode: searchedCode.trim() },
    { enabled: Boolean(searchedCode.trim()) },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputCode.trim();
    if (!clean) return;
    setSearchedCode(clean);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.verify-header',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: '.verify-header',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        },
      );

      gsap.fromTo(
        '.verify-box',
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: '.verify-box',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        },
      );
    }, container);

    return () => ctx.revert();
  }, []);

  const certificateData = verifyQuery.data as any;
  const isVerified = Boolean(verifyQuery.isSuccess && certificateData);
  const isError = Boolean(verifyQuery.isError && searchedCode);

  return (
    <section
      id="verify"
      ref={containerRef}
      className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-muted/20 border-b border-border relative overflow-hidden"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="verify-header text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 mb-3">
            <AcademicNote variant="outline">Validasi Keaslian Dokumen</AcademicNote>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight mb-4">
            Verifikasi{' '}
            <span className="relative inline-block">
              <ScribbleCircle colorClassName="text-primary">
                <span>Sertifikat</span>
              </ScribbleCircle>
            </span>{' '}
            Resmi
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Pastikan keaslian sertifikat SIMAD melalui kode verifikasi yang tertera pada bagian
            bawah dokumen sertifikat digital Anda.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 select-none">
            <ScribbleArrow variant="curved-right" className="w-5 h-5 text-primary rotate-12" />
            <span className="text-xs font-mono text-primary font-medium">
              "terbuka untuk pihak kampus, instansi, & rekruter"
            </span>
          </div>
        </div>

        {/* Verification Form Card */}
        <div className="verify-box bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center gap-3 mb-6"
          >
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Masukkan kode verifikasi (contoh: CERT-2026-001)"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-mono"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={verifyQuery.isFetching || !inputCode.trim()}
              className="w-full sm:w-auto rounded-xl px-8 py-3 h-11 text-sm font-semibold shadow-xs cursor-pointer"
            >
              {verifyQuery.isFetching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Memeriksa...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 mr-1.5" />
                  <span>Verifikasi</span>
                </>
              )}
            </Button>
          </form>

          {/* Verification Results Feedback */}
          {isVerified && certificateData && (
            <div className="rounded-xl bg-success/5 border border-success/30 p-6 animate-enter">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-5 border-b border-success/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/20 text-success flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-foreground">
                      Sertifikat Terverifikasi Sah
                    </h4>
                    <p className="text-xs text-muted-foreground font-mono">
                      No. Sertifikat: {certificateData.certificateNumber || searchedCode}
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-success/15 text-success">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Resmi PT PLN (Persero)
                </div>
              </div>

              {/* Data Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Nama Peserta:</span>
                    <strong className="text-foreground font-semibold">
                      {certificateData.internship?.intern?.fullName || 'Peserta Magang SIMAD'}
                    </strong>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <GraduationCap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Perguruan Tinggi:
                    </span>
                    <span className="text-foreground font-medium">
                      {certificateData.internship?.intern?.university?.name ||
                        'Perguruan Tinggi Terakreditasi'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Unit Kerja & Divisi:
                    </span>
                    <span className="text-foreground font-medium">
                      {certificateData.internship?.officeLocation?.name || 'Unit PT PLN (Persero)'}{' '}
                      — {certificateData.internship?.department?.name || 'Operasional'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Status Kelulusan:
                    </span>
                    <span className="text-foreground font-medium">
                      {certificateData.internship?.status || 'Selesai (Completed)'}
                      {certificateData.internship?.evaluation?.grade &&
                        ` • Nilai: ${certificateData.internship.evaluation.grade}`}
                    </span>
                  </div>
                </div>
              </div>

              {certificateData.fileUrl && (
                <div className="mt-5 pt-4 border-t border-success/20 flex justify-end">
                  <a
                    href={certificateData.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh Dokumen Sertifikat Asli
                  </a>
                </div>
              )}
            </div>
          )}

          {isError && (
            <div className="rounded-xl bg-destructive/5 border border-destructive/30 p-5 animate-enter flex items-start gap-3">
              <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-destructive mb-1">
                  Sertifikat Tidak Ditemukan
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Kode verifikasi{' '}
                  <strong className="font-mono text-foreground">"{searchedCode}"</strong> tidak
                  terdaftar pada pangkalan data resmi SIMAD PT PLN (Persero). Pastikan Anda
                  memasukkan format kode yang benar sesuai dengan yang tercantum pada dokumen.
                </p>
              </div>
            </div>
          )}

          {/* Quick Help Tip */}
          <div className="mt-6 pt-5 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-primary shrink-0" />
              <span>
                Kode sertifikat dapat dilihat di bagian pojok bawah atau di bawah QR Code dokumen.
              </span>
            </div>
            <span className="font-mono text-[11px] text-primary">Validasi Instan 24/7</span>
          </div>
        </div>
      </div>
    </section>
  );
}
