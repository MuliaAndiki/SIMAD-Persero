"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CheckCircle2,
  FileCheck2,
  FileText,
  IdCard,
  MailCheck,
  School,
  UserCheck,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { AcademicNote, ScribbleArrow } from "./primitives";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const REQUIREMENTS = [
  {
    title: "Curriculum Vitae (CV) Terbaru",
    status: "Wajib",
    badgeType: "sticky" as const,
    icon: FileText,
    desc: "Format PDF (maks 2MB). Cantumkan riwayat pendidikan, keahlian teknis, dan portofolio proyek relevan.",
  },
  {
    title: "Surat Pengantar Resmi Fakultas",
    status: "Wajib",
    badgeType: "sticky" as const,
    icon: FileCheck2,
    desc: "Surat resmi dari dekanat/jurusan yang menyatakan izin pelaksanaan magang dan durasi yang diajukan.",
  },
  {
    title: "Kartu Tanda Mahasiswa (KTM)",
    status: "Wajib",
    badgeType: "sticky" as const,
    icon: IdCard,
    desc: "Scan/foto identitas mahasiswa aktif yang masih berlaku selama periode magang berlangsung.",
  },
  {
    title: "Data Institusi & Program Studi",
    status: "Lengkap",
    badgeType: "marker" as const,
    icon: School,
    desc: "Nama perguruan tinggi terakreditasi, jenjang studi (SLTA/D3/D4/S1), dan nomor induk mahasiswa (NIM).",
  },
  {
    title: "Data Pribadi & NIK (KTP)",
    status: "Lengkap",
    badgeType: "marker" as const,
    icon: UserCheck,
    desc: "Identitas kependudukan sah untuk penerbitan tanda pengenal sementara & asuransi kerja lingkungan PLN.",
  },
  {
    title: "Email & Kontak WhatsApp Aktif",
    status: "Lengkap",
    badgeType: "marker" as const,
    icon: MailCheck,
    desc: "Alamat surel utama untuk aktivasi akun dan nomor telepon aktif guna konfirmasi wawancara/orientasi.",
  },
];

export function RequirementsSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".req-header",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: ".req-header",
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );

      gsap.fromTo(
        ".req-item",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          scrollTrigger: {
            trigger: ".req-grid",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="requirements"
      ref={containerRef}
      className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="req-header text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 mb-3">
            <AcademicNote variant="outline">Kelengkapan Berkas</AcademicNote>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight mb-4">
            Sebelum Mendaftar,{" "}
            <span className="text-primary underline decoration-warning/60 decoration-wavy decoration-2 underline-offset-8">
              Pastikan Dokumenmu Siap
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Pemeriksaan berkas dilakukan secara teliti oleh tim HR. Pastikan
            dokumen administratif berikut telah disiapkan dalam bentuk file
            digital sebelum mengisi form pengajuan.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 select-none">
            <ScribbleArrow
              variant="curved-right"
              className="w-5 h-5 text-primary rotate-12"
            />
            <span className="text-xs font-mono text-primary font-medium">
              "periksa format & kejelasan tulisan sebelum unggah"
            </span>
          </div>
        </div>

        {/* Requirements Grid (Easy to scan checklist cards) */}
        <div className="req-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {REQUIREMENTS.map((req) => {
            const Icon = req.icon;
            const isMandatory = req.status === "Wajib";
            return (
              <div
                key={req.title}
                className="req-item bg-card border border-border rounded-xl p-6 relative hover:border-primary/40 transition-all duration-300 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-xs font-semibold tracking-wide ${
                        isMandatory
                          ? "bg-destructive/10 text-destructive border border-destructive/20"
                          : "bg-primary/10 text-primary border border-primary/20"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {req.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground mb-2">
                    {req.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {req.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-border/50 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Siapkan format digital (PDF)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
