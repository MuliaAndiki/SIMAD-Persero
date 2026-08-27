'use client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Award, Calendar, ChevronRight, FileText, MapPin } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useRef } from 'react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function LandingFeatures() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.feat-heading',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: '.feat-heading',
            start: 'top 80%',
          },
        },
      );

      gsap.fromTo(
        '.feat-card',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.feat-grid',
            start: 'top 75%',
          },
        },
      );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="features"
      ref={container}
      className="py-24 bg-card px-4 sm:px-6 lg:px-8 border-y border-border"
    >
      <div className="max-w-7xl mx-auto">
        <div className="feat-heading text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ekosistem Fitur Lengkap
          </h2>
          <p className="text-muted-foreground text-lg">
            Satu sistem yang didesain secara spesifik untuk memfasilitasi kebutuhan seluruh pihak
            dalam program magang.
          </p>
        </div>

        <div className="feat-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {/* Main Feature - Large Col */}
          <div className="feat-card md:col-span-2 lg:col-span-2 row-span-2 bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-8 border border-primary/20 relative overflow-hidden group">
            <div className="relative z-10 w-full md:w-1/2">
              <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Absensi Geofencing</h3>
              <p className="text-foreground/80 mb-8 leading-relaxed">
                Tinggalkan absensi manual dengan tanda tangan. SIMAD memverifikasi kehadiran peserta
                magang berdasarkan radius lokasi yang telah ditentukan secara otomatis.
              </p>
              <Link
                href="https://www.google.com/maps/place/PLN+UID+Aceh/@5.5626283,95.3335993,18.81z/data=!4m10!1m2!2m1!1spln+aceh+uid!3m6!1s0x304037005a2807b3:0xb359a7eea219d8fe!8m2!3d5.5623212!4d95.334821!15sCgxwbG4gYWNlaCB1aWQiA4gBAVoOIgxwbG4gYWNlaCB1aWSSARhlbGVjdHJpY191dGlsaXR5X2NvbXBhbnmaAURDaTlEUVVsUlFVTnZaRU5vZEhsalJqbHZUMnRHZUZWRVJtRlBWbWhVVTBSa1QwNVZhRE5rVmtacVlWYzFTVmxXUlJBQuABAPoBBAgAEBo!16s%2Fg%2F11xdjprv1n?entry=ttu&g_ep=EgoyMDI2MDgxNy4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary font-medium group-hover:underline relative z-20"
              >
                Lihat lokasi validasi
                <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            {/* Visual element - Google Maps Embed */}
            <div className="absolute right-0 bottom-0 top-0 w-[45%] hidden md:flex items-center justify-end pr-8 group-hover:opacity-100 transition-opacity">
              <div className="w-full h-4/5 rounded-2xl overflow-hidden shadow-xl shadow-primary/10 border-4 border-card relative z-10">
                <iframe
                  src="https://maps.google.com/maps?q=5.5623212,95.334821&z=17&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 z-10"
                />
                {/* Overlay map element */}
                <div className="absolute top-4 right-4 z-20 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm border border-border flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold text-foreground">Area Geofence Aktif</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Features */}
          <div className="feat-card bg-muted/50 rounded-3xl p-8 border border-border hover:border-primary/30 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center mb-6">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Manajemen Pengajuan</h3>
            <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
              Pendaftaran magang, pengumpulan berkas, hingga pengumuman penerimaan dikelola dalam
              alur yang terpusat.
            </p>
          </div>

          <div className="feat-card bg-muted/50 rounded-3xl p-8 border border-border hover:border-primary/30 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-accent text-accent-foreground flex items-center justify-center mb-6">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">E-Certificate Digital</h3>
            <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
              Setelah selesai, program secara otomatis menerbitkan sertifikat digital yang dapat
              diverifikasi keasliannya.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
