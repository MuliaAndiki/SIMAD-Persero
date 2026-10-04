'use client';

import { appConfig } from '@/configs/app.config';
import { useLenis } from 'lenis/react';
import { Award, Building2, MapPin, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export function LandingFooter() {
  const lenis = useLenis();

  const scrollToHash = (hash: string) => {
    const target = document.querySelector(hash) as HTMLElement | null;
    if (target) {
      if (lenis) {
        lenis.scrollTo(target, { offset: -90, duration: 1.2 });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="border-t border-border bg-card text-card-foreground pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-14 border-b border-border">
          {/* Col 1: Brand & Description (Span 2) */}
          <div className="lg:col-span-2">
            <Link href="/home" className="flex items-center gap-3 mb-4">
              <Image
                src={appConfig.logo}
                alt="Logo SIMAD PLN"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
              <div className="flex flex-col leading-none">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xl tracking-tight text-foreground">SIMAD</span>
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary border border-primary/20">
                    PERSERO
                  </span>
                </div>
                <span className="text-xs text-muted-foreground font-medium mt-0.5">
                  PT PLN (Persero)
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mb-6">
              Sistem Informasi Manajemen Magang resmi PT PLN (Persero) yang mendigitalisasi seluruh
              tahapan pendaftaran, absensi geofence, bimbingan mentor, evaluasi, hingga sertifikat
              digital terakreditasi.
            </p>

            <div className="flex items-center gap-2 text-xs font-medium text-foreground/80">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>Sistem Manajemen Magang Terintegrasi PLN</span>
            </div>
          </div>

          {/* Col 2: Navigasi Anchor */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              Navigasi Halaman
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToHash('#about')}
                  className="hover:text-primary transition-colors text-left cursor-pointer"
                >
                  Tentang SIMAD
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToHash('#lifecycle')}
                  className="hover:text-primary transition-colors text-left cursor-pointer"
                >
                  Alur Magang (9 Langkah)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToHash('#guide')}
                  className="hover:text-primary transition-colors text-left cursor-pointer"
                >
                  Panduan Pendaftaran
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToHash('#requirements')}
                  className="hover:text-primary transition-colors text-left cursor-pointer"
                >
                  Persyaratan Dokumen
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToHash('#locations')}
                  className="hover:text-primary transition-colors text-left cursor-pointer"
                >
                  Unit Penempatan Magang
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToHash('#features')}
                  className="hover:text-primary transition-colors text-left cursor-pointer"
                >
                  Fitur Utama Sistem
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToHash('#faq')}
                  className="hover:text-primary transition-colors text-left cursor-pointer"
                >
                  Pusat Bantuan (FAQ)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Layanan Peserta */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              Layanan Peserta
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToHash('#verify')}
                  className="hover:text-primary transition-colors font-medium text-foreground flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <Award className="w-3.5 h-3.5 text-primary" />
                  Verifikasi Sertifikat
                </button>
              </li>
              <li>
                <Link href="/register" className="hover:text-primary transition-colors">
                  Daftar Akun Baru
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary transition-colors">
                  Masuk ke Portal Peserta
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToHash('#tutorial')}
                  className="hover:text-primary transition-colors text-left cursor-pointer"
                >
                  Video Tutorial
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Informasi & Kantor PLN */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              Kantor Pusat PLN
            </h4>
            <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Jl. Trunojoyo Blok M - I No. 135, Kebayoran Baru, Jakarta Selatan 12160</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-primary shrink-0" />
                <span>PT PLN (Persero) Kantor Pusat</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>Divisi Pengembangan Human Capital</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} PT PLN (Persero). SIMAD — Sistem Informasi Manajemen
            Magang. Hak Cipta Dilindungi.
          </p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] text-primary">Inovasi Digital PLN</span>
            <span>•</span>
            <span>Sistem Resmi Korporat</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
