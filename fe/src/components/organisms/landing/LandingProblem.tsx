'use client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  FileStack,
  MapPin,
  Search,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import React, { useEffect, useRef } from 'react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function LandingProblem() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: isMobile ? 'top 80%' : 'top 70%',
          end: 'bottom center',
          toggleActions: 'play none none reverse',
        },
      });

      tl.fromTo(
        '.problem-title',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      )
        .fromTo(
          '.problem-card-left',
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' },
          '-=0.4',
        )
        .fromTo(
          '.problem-arrow',
          { opacity: 0, scale: 0.5 },
          { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)' },
          '-=0.2',
        )
        .fromTo(
          '.problem-card-right',
          { opacity: 0, x: 30 },
          { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' },
          '-=0.2',
        );

      gsap.utils.toArray('.problem-stagger').forEach((el, _index) => {
        gsap.fromTo(
          el as Element,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el as Element,
              start: 'top 90%',
            },
          },
        );
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="problem"
      ref={container}
      className="relative py-20 md:py-32 bg-muted/30 px-4 sm:px-6 lg:px-8 border-y border-border overflow-hidden"
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <div className="text-center max-w-2xl mb-16 problem-title">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Mengapa Beralih ke SIMAD?
          </h2>
          <p className="text-muted-foreground text-lg">
            Proses manual yang memakan waktu dan berisiko kehilangan data kini tidak lagi menjadi
            kendala. Transformasi digital membuat segalanya lebih mudah dilacak.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 w-full max-w-5xl">
          {/* Manual Process */}
          <div className="problem-card-left w-full lg:w-5/12 bg-card border border-destructive/20 rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-xl font-semibold mb-6 text-foreground flex items-center gap-2">
              <span className="shrink-0 w-8 h-8 rounded bg-destructive/10 text-destructive flex items-center justify-center">
                <FileStack className="w-4 h-4" />
              </span>
              Proses Manual
            </h3>

            <ul className="space-y-4">
              <li className="problem-stagger flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-destructive/70 shrink-0 mt-0.5" />
                <span className="text-foreground/80">
                  Dokumen fisik rawan hilang atau terselip.
                </span>
              </li>
              <li className="problem-stagger flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-destructive/70 shrink-0 mt-0.5" />
                <span className="text-foreground/80">
                  Rekapitulasi absensi dilakukan secara manual setiap akhir bulan.
                </span>
              </li>
              <li className="problem-stagger flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-destructive/70 shrink-0 mt-0.5" />
                <span className="text-foreground/80">
                  Sertifikat diketik dan dicetak satu per satu per siswa/mahasiswa.
                </span>
              </li>
              <li className="problem-stagger flex items-start gap-3">
                <Clock className="w-5 h-5 text-destructive/70 shrink-0 mt-0.5" />
                <span className="text-foreground/80">
                  Proses panjang dari pengajuan hingga persetujuan supervisor.
                </span>
              </li>
            </ul>
          </div>

          {/* Arrow */}
          <div className="problem-arrow shrink-0 hidden lg:flex w-16 h-16 rounded-full bg-primary/10 border border-primary/20 items-center justify-center text-primary shadow-inner">
            <ArrowRight className="w-6 h-6" />
          </div>

          <div className="problem-arrow shrink-0 flex lg:hidden w-12 h-12 rounded-full bg-primary/10 border border-primary/20 items-center justify-center text-primary rotate-90">
            <ArrowRight className="w-5 h-5" />
          </div>

          {/* Digital Process */}
          <div className="problem-card-right w-full lg:w-5/12 bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8 shadow-md">
            <h3 className="text-xl font-semibold mb-6 text-foreground flex items-center gap-2">
              <span className="shrink-0 w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </span>
              Digital dengan SIMAD
            </h3>

            <ul className="space-y-4">
              <li className="problem-stagger flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground/80 font-medium">Paperless</span>
                <span className="text-muted-foreground hidden sm:inline">
                  - Pengajuan & dokumen terpusat.
                </span>
              </li>
              <li className="problem-stagger flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground/80 font-medium">Validasi Lokasi</span>
                <span className="text-muted-foreground hidden sm:inline">
                  - Absensi tercatat real-time.
                </span>
              </li>
              <li className="problem-stagger flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground/80 font-medium">E-Certificate</span>
                <span className="text-muted-foreground hidden sm:inline">
                  - Dihasilkan otomatis via sistem.
                </span>
              </li>
              <li className="problem-stagger flex items-start gap-3">
                <Search className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground/80 font-medium">Monitoring</span>
                <span className="text-muted-foreground hidden sm:inline">
                  - Pelacakan aktivitas oleh supervisor transparan.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
