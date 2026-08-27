'use client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Activity,
  Award,
  CheckCircle,
  FileUp,
  Flag,
  MapPin,
  PlayCircle,
  ShieldCheck,
} from 'lucide-react';
import React, { useEffect, useRef } from 'react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const steps = [
  { id: 1, title: 'Pengajuan', icon: FileUp, desc: 'Submit berkas' },
  { id: 2, title: 'Verifikasi', icon: ShieldCheck, desc: 'Review oleh tim HR' },
  { id: 3, title: 'Onboarding', icon: PlayCircle, desc: 'Pengenalan sistem' },
  { id: 4, title: 'Penempatan', icon: MapPin, desc: 'Alokasi departemen' },
  { id: 5, title: 'Absensi', icon: CheckCircle, desc: 'Check-in harian' },
  { id: 6, title: 'Monitoring', icon: Activity, desc: 'Pantau aktivitas' },
  { id: 7, title: 'Selesai', icon: Flag, desc: 'Evaluasi akhir' },
  { id: 8, title: 'Sertifikat', icon: Award, desc: 'E-certificate' },
];

export function LandingWorkflow() {
  const container = useRef<HTMLDivElement>(null);
  const scrollTrack = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const isDesktop = window.innerWidth >= 1024;

      // Animate workflow header
      gsap.fromTo(
        '.wf-header',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: '.wf-header',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        },
      );

      // Node stagger animation
      gsap.fromTo(
        '.wf-node',
        { opacity: 0, scale: 0.8, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          scrollTrigger: {
            trigger: scrollTrack.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        },
      );

      // Line progress animation
      gsap.fromTo(
        '.wf-progress-line',
        {
          scaleX: 0,
          transformOrigin: isDesktop ? 'left center' : 'top center',
          scaleY: isDesktop ? 1 : 0,
        },
        {
          scaleX: 1,
          scaleY: 1,
          duration: 1.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: scrollTrack.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        },
      );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section id="workflow" ref={container} className="py-24 bg-background px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 wf-header">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Alur Kerja SIMAD</h2>
          <p className="text-muted-foreground text-lg">
            Satu platform untuk seluruh siklus lifecycle peserta magang, mulai dari registrasi
            hingga sertifikat.
          </p>
        </div>

        <div className="relative mt-20" ref={scrollTrack}>
          {/* Track background */}
          <div className="absolute left-[27px] lg:left-0 lg:top-[27px] top-0 bottom-0 lg:bottom-auto w-[2px] lg:h-[2px] lg:w-full bg-border rounded-full" />

          {/* Track progress indicator */}
          <div className="wf-progress-line absolute left-[27px] lg:left-0 lg:top-[27px] top-0 bottom-0 lg:bottom-auto w-[2px] lg:h-[2px] lg:w-full bg-primary rounded-full z-0" />

          <div className="flex flex-col lg:flex-row justify-between gap-8 lg:gap-0 relative z-10 w-full">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className="wf-node flex flex-row lg:flex-col items-start lg:items-center gap-6 lg:gap-4 relative w-full lg:w-[12.5%] group cursor-pointer"
                >
                  <div className="shrink-0 w-14 h-14 rounded-full bg-card border-2 border-border group-hover:border-primary group-hover:text-primary text-muted-foreground flex items-center justify-center transition-colors z-10 shadow-sm relative">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="lg:text-center mt-2 lg:mt-0 pb-6 lg:pb-0 relative">
                    <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    {/* Hover tooltip for description */}
                    <div className="absolute opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 left-0 lg:left-1/2 lg:-translate-x-1/2 top-full mt-2 w-max max-w-[160px] bg-popover text-popover-foreground text-sm p-3 rounded-lg shadow-lg border border-border scale-95 group-hover:scale-100">
                      {step.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
