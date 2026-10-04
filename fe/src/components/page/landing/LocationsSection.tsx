"use client";

import { useApi } from "@/hooks/useService/useApi";
import type { OfficeResponse } from "@/types/api/office.types";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Building2,
  CheckCircle,
  Clock,
  Compass,
  Cpu,
  ExternalLink,
  Factory,
  Globe2,
  Lightbulb,
  MapPin,
  Navigation,
  Network,
  Radio,
  ShieldCheck,
  Zap,
} from "lucide-react";
import React, { useEffect, useRef } from "react";
import { AcademicNote, ScribbleArrow } from "./primitives";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const FALLBACK_LOCATION_UNITS = [
  {
    type: "Kantor Unit Induk (UID)",
    name: "PLN UID ACEH",
    location: "Jl. T. Panglima Nyak Makam No. 1, Banda Aceh",
    radius: "100m Geofence",
    departments: [
      "Perencanaan & Sistem",
      "Keuangan & Anggaran",
      "Human Capital & Manajemen Talenta",
      "Niaga & Pelayanan Pelanggan",
      "Operasi Distribusi & SCADA",
      "Komunikasi Korporat & TJSL",
    ],
  },
  {
    type: "Unit Pelaksana Pelayanan (UP3)",
    name: "UP3 Banda Aceh",
    location: "Jl. Teuku Umar No. 12, Banda Aceh",
    radius: "80m Geofence",
    departments: [
      "Bagian Jaringan & Pemeliharaan",
      "Transaksi Energi Listrik",
      "Pemasaran & Pelayanan",
      "K3L & Keamanan Kerja",
      "Konstruksi Jaringan Distribusi",
      "Pengadaan & Logistik",
    ],
  },
];

const DISCIPLINE_TRACKS = [
  {
    title: "Teknik Elektro & Energi",
    icon: Zap,
    skills: "Power System, Proteksi, Smart Grid, SCADA",
  },
  {
    title: "Teknologi Informasi & Data",
    icon: Cpu,
    skills: "Web/Mobile, Database, Cyber Security, Analytics",
  },
  {
    title: "Teknik Mesin & Sipil",
    icon: Factory,
    skills: "Pembangkit, Mekanikal, Struktur Fisik Jaringan",
  },
  {
    title: "Manajemen & Komunikasi",
    icon: Globe2,
    skills: "Human Capital, Public Relations, Sustainability",
  },
];
interface LocationsSectionProps {
  office: OfficeResponse[];
  isLoading: boolean;
}

export function LocationsSection({ office, isLoading }: LocationsSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const realOffices = office && office.length > 0 ? office : null;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".loc-header",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: ".loc-header",
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );

      gsap.fromTo(
        ".loc-card",
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          scrollTrigger: {
            trigger: ".loc-grid",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      );

      gsap.fromTo(
        ".track-card",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          scrollTrigger: {
            trigger: ".track-grid",
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
      id="locations"
      ref={containerRef}
      className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-muted/20 border-b border-border relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="loc-header text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 mb-3">
            <AcademicNote variant="outline">
              Lingkup Penempatan Nasional
            </AcademicNote>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight mb-4">
            Unit Kerja Penempatan Magang
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            SIMAD terhubung langsung dengan unit operasional PT PLN (Persero).
            Mahasiswa dapat memilih unit dan departemen yang sesuai dengan
            kompetensi akademis.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 select-none">
            <ScribbleArrow
              variant="curved-down-right"
              className="w-5 h-5 text-muted-foreground rotate-12"
            />
            <span className="text-xs font-mono text-muted-foreground">
              data unit dan departemen tersinkronisasi langsung dari database
              SIMAD
            </span>
          </div>
        </div>

        {/* Units Grid */}
        <div className="loc-grid grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16">
          {isLoading
            ? // Skeleton state
              [1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-xl p-6 lg:p-7 space-y-4 animate-pulse"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-5 bg-muted rounded w-1/4" />
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-5 bg-muted rounded w-2/3" />
                      <div className="h-4 bg-muted rounded w-4/5" />
                    </div>
                  </div>
                  <div className="h-24 bg-muted/60 rounded-lg" />
                </div>
              ))
            : realOffices
              ? // Real Database Offices
                realOffices.map((unit: OfficeResponse) => (
                  <div
                    key={unit.id || unit.name}
                    className="loc-card bg-card border border-border rounded-xl p-6 lg:p-7 relative hover:border-primary/50 transition-all duration-300 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                          <Radio className="w-3 h-3 text-primary animate-pulse" />
                          Unit Terdaftar SIMAD
                        </span>
                        <AcademicNote variant="sticky" rotate="none">
                          {unit.radiusMeter}m Geofence
                        </AcademicNote>
                      </div>

                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-foreground">
                            {unit.name}
                          </h3>
                          <div className="flex items-start gap-1.5 text-xs text-muted-foreground mt-1">
                            <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                            <span className="leading-snug">{unit.address}</span>
                          </div>

                          {unit.latitude !== null &&
                            unit.longitude !== null && (
                              <a
                                href={`https://www.google.com/maps?q=${unit.latitude},${unit.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-[11px] font-mono text-primary/80 hover:text-primary transition-colors mt-2"
                              >
                                <Navigation className="w-3 h-3" />
                                <span>
                                  {unit.latitude.toFixed(4)},{" "}
                                  {unit.longitude.toFixed(4)}
                                </span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                              </a>
                            )}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-border/60">
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-xs font-semibold text-foreground">
                            Departemen & Divisi Magang (
                            {unit.departments?.length || 0} Divisi):
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            Penempatan Aktif
                          </span>
                        </div>

                        {unit.departments && unit.departments.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {unit.departments.map((dept) => (
                              <span
                                key={dept.id}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-secondary/70 text-foreground/90 border border-border/60 hover:border-primary/40 transition-colors"
                              >
                                <CheckCircle className="w-3 h-3 text-primary shrink-0" />
                                <span>{dept.name}</span>
                                {dept.code && (
                                  <span className="text-[10px] font-mono text-muted-foreground">
                                    • {dept.code}
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">
                            Departemen sedang dalam proses sinkronisasi kuota.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                        Presensi Berbasis Radius ({unit.radiusMeter}m)
                      </span>
                    </div>
                  </div>
                ))
              : // Fallback Units
                FALLBACK_LOCATION_UNITS.map((unit) => (
                  <div
                    key={unit.name}
                    className="loc-card bg-card border border-border rounded-xl p-6 lg:p-7 relative hover:border-primary/50 transition-all duration-300 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                          {unit.type}
                        </span>
                        <AcademicNote variant="sticky" rotate="none">
                          {unit.radius}
                        </AcademicNote>
                      </div>

                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">
                            {unit.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>{unit.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-border/60">
                        <span className="text-xs font-semibold text-foreground block mb-2">
                          Fokus Bidang & Divisi Magang:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {unit.departments.map((item) => (
                            <span
                              key={item}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-secondary/70 text-foreground/90 border border-border/60"
                            >
                              <CheckCircle className="w-3 h-3 text-primary shrink-0" />
                              <span>{item}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                        Bimbingan Mentor Profesional
                      </span>
                      <span className="font-mono text-primary font-medium">
                        Resmi SIMAD
                      </span>
                    </div>
                  </div>
                ))}
        </div>
      </div>
    </section>
  );
}
