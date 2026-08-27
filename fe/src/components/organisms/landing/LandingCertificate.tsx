'use client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Award, CheckCircle, Download, FileSignature } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function LandingCertificate() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.cert-container',
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      });

      tl.fromTo(
        '.cert-document',
        { opacity: 0, y: 50, rotateX: 20 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 1,
          ease: 'power3.out',
          transformPerspective: 1000,
        },
      );

      tl.fromTo(
        '.cert-step',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.2, ease: 'power2.out' },
        '-=0.5',
      );
    }, container);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="certificate"
      ref={container}
      className="py-24 bg-muted/20 px-4 sm:px-6 lg:px-8 border-y border-border overflow-hidden"
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24 cert-container">
        {/* Left Side: Context */}
        <div className="w-full lg:w-5/12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Penerbitan Sertifikat Otomatis
          </h2>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            SIMAD meniadakan rekapitulasi data akhir secara manual. Sertifikat digital dihasilkan
            otomatis setelah seluruh persyaratan magang terpenuhi.
          </p>

          <div className="space-y-6">
            <div className="cert-step flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-lg">Magang Selesai</h4>
                <p className="text-muted-foreground text-sm">
                  Peserta mencapai akhir durasi magang.
                </p>
              </div>
            </div>

            <div className="cert-step flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileSignature className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-lg">Persyaratan Diverifikasi</h4>
                <p className="text-muted-foreground text-sm">
                  Validasi kehadiran minimal & evaluasi disetujui.
                </p>
              </div>
            </div>

            <div className="cert-step flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-lg">Sertifikat Diterbitkan</h4>
                <p className="text-muted-foreground text-sm">
                  E-certificate dapat diunduh kapan saja.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Visual Certificate */}
        <div className="w-full lg:w-7/12 perspective-1000">
          <div className="cert-document relative aspect-[1.414/1] bg-card border-[3px] border-border rounded-xl shadow-2xl p-6 md:p-10 flex flex-col justify-center items-center overflow-hidden">
            {/* Watermark / Background Texture */}
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent" />

            {/* Corner decorations */}
            <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-primary/30" />
            <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-primary/30" />
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-primary/30" />
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-primary/30" />

            <div className="w-16 h-16 bg-primary/10 rounded-full mb-6 border border-primary/20 flex items-center justify-center">
              <Award className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-3xl md:text-5xl font-serif text-foreground mb-4 uppercase tracking-wider text-center">
              Certificate
            </h3>
            <p className="text-muted-foreground tracking-widest uppercase text-xs md:text-sm mb-8 text-center text-primary/80">
              of Completion
            </p>

            <div className="w-full max-w-sm flex flex-col items-center gap-4">
              <div className="w-3/4 h-2 bg-muted rounded-full" />
              <div className="w-full h-8 bg-foreground/5 rounded flex justify-center items-center">
                <div className="w-1/2 h-2 bg-foreground/20 rounded-full" />
              </div>
              <div className="w-5/6 h-2 bg-muted rounded-full mt-4" />
              <div className="w-4/6 h-2 bg-muted rounded-full" />
            </div>

            <div className="absolute bottom-10 left-10 w-24 h-24 border-2 border-primary/20 rounded-full flex flex-col items-center justify-center opacity-60">
              <span className="text-[8px] uppercase tracking-wider text-primary text-center leading-tight">
                Digital
                <br />
                Verifiable
              </span>
            </div>

            <div className="absolute bottom-12 right-12 flex flex-col items-center">
              <div className="w-32 h-6 border-b border-border/60 mb-2" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                Authorized Signature
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
