"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const benefits = [
  {
    title: "Lebih Terstruktur",
    desc: "Alur program dari awal hingga akhir tertata dengan jelas tanpa ada proses yang terlewat.",
  },
  {
    title: "Terdokumentasi Penuh",
    desc: "Seluruh sejarah pengajuan, absensi, hingga evaluasi direkam aman dalam satu platform.",
  },
  {
    title: "Mudah Dipantau",
    desc: "Akses informasi real-time bagi supervisor dan admin untuk mengambil keputusan lebih cepat.",
  },
  {
    title: "Transparansi Data",
    desc: "Menghindari perselisihan data absensi melalui validasi sistem dan laporan yang terpusat.",
  },
];

export function LandingBenefits() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(
        ".benefit-item",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: {
            trigger: container.current,
            start: "top 80%",
          },
        },
      );
    }, container);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={container}
      className="py-24 bg-card px-4 sm:px-6 lg:px-8 border-y border-border"
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-16 text-center">
          Dampak Positif SIMAD
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="benefit-item flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mb-6 text-2xl font-serif text-primary">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">
                {b.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
