"use client";

import Image from "next/image";
import type React from "react";
import { cn } from "@/utils/classname";

export interface PublicPageLoaderProps {
  label?: string;
  sublabel?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  className?: string;
}

export function PublicPageLoader({
  label = "Memuat Halaman...",
  sublabel = "Menyiapkan modul dan data pembelajaran SIMANTIK...",
  size = "md",
  fullScreen = false,
  className,
}: PublicPageLoaderProps) {
  const sizeMap = {
    sm: {
      container: "w-20 h-20",
      svg: 88,
      logoSize: 42,
      strokeWidth: 3,
    },
    md: {
      container: "w-28 h-28",
      svg: 120,
      logoSize: 58,
      strokeWidth: 3.5,
    },
    lg: {
      container: "w-36 h-36",
      svg: 154,
      logoSize: 76,
      strokeWidth: 4,
    },
  }[size];

  const content = (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        "flex flex-col items-center justify-center text-center p-6 select-none",
        className,
      )}
    >
      {/* Outer Orbit & Logo Container */}
      <div
        className={cn(
          "relative flex items-center justify-center",
          sizeMap.container,
        )}
      >
        {/* Soft Background Ripple Wave */}
        {/* <div className="absolute inset-0 rounded-full bg-teal-400/10 animate-ping duration-1000 pointer-events-none" /> */}

        {/* Ambient Glow */}
        <div className="absolute inset-1 rounded-full bg-linear-to-tr from-teal-500/20 via-amber-400/20 to-teal-600/20 blur-lg pointer-events-none" />

        {/* SVG Orbiting Spinning Bar Ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 animate-spin"
          style={{
            animationDuration: "1.4s",
            animationTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          viewBox={`0 0 ${sizeMap.svg} ${sizeMap.svg}`}
        >
          <title>Memuat</title>
          <defs>
            <linearGradient
              id="simantikLoaderGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#0D9488" stopOpacity="0.15" />
              <stop offset="40%" stopColor="#0D9488" stopOpacity="0.8" />
              <stop offset="85%" stopColor="#F5B731" stopOpacity="1" />
              <stop offset="100%" stopColor="#FBBF24" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Background Track Ring */}
          <circle
            cx={sizeMap.svg / 2}
            cy={sizeMap.svg / 2}
            r={(sizeMap.svg - sizeMap.strokeWidth * 3) / 2}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={sizeMap.strokeWidth}
            className="opacity-60"
          />

          {/* Animated Orbiting Arc */}
          <circle
            cx={sizeMap.svg / 2}
            cy={sizeMap.svg / 2}
            r={(sizeMap.svg - sizeMap.strokeWidth * 3) / 2}
            fill="none"
            stroke="url(#simantikLoaderGradient)"
            strokeWidth={sizeMap.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${(sizeMap.svg - sizeMap.strokeWidth * 3) * Math.PI * 0.7} ${(sizeMap.svg - sizeMap.strokeWidth * 3) * Math.PI * 0.3}`}
          />
        </svg>

        {/* Center White Glassmorphism Badge with Logo */}
        <div className="relative z-10 rounded-full bg-background backdrop-blur-md p-2 shadow-lg border border-slate-100 flex items-center justify-center transition-transform animate-pulse duration-1000">
          <Image
            src="/images/logos.png"
            alt="Logo SIMAD"
            width={sizeMap.logoSize}
            height={sizeMap.logoSize}
            priority
            className="object-contain drop-shadow-xs pointer-events-none"
          />
        </div>
      </div>

      {/* Text Label & Sublabel */}
      {(label || sublabel) && (
        <div className="mt-5 space-y-1.5 max-w-sm">
          {label && (
            <h4 className="text-sm sm:text-base font-black text-slate-800 tracking-tight flex items-center justify-center gap-1">
              <span>{label}</span>
            </h4>
          )}
          {sublabel && (
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              {sublabel}
            </p>
          )}

          {/* Animated Mini Dot Indicator */}
          <div className="flex items-center justify-center gap-1.5 pt-2">
            <span
              className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-teal-700 animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background backdrop-blur-md">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[55vh] w-full">
      {content}
    </div>
  );
}

export default PublicPageLoader;
