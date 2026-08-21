"use client";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  LogIn,
  MapPin,
  CheckSquare,
  Search,
  LogOut,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/utils/classname";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const attSteps = [
  {
    id: 1,
    label: "Check In",
    icon: LogIn,
    defaultColor: "bg-blue-100 text-blue-600",
  },
  {
    id: 2,
    label: "Lokasi",
    icon: MapPin,
    defaultColor: "bg-amber-100 text-amber-600",
  },
  {
    id: 3,
    label: "Tercatat",
    icon: CheckSquare,
    defaultColor: "bg-green-100 text-green-600",
  },
  {
    id: 4,
    label: "Pantau",
    icon: Search,
    defaultColor: "bg-purple-100 text-purple-600",
  },
  {
    id: 5,
    label: "Check Out",
    icon: LogOut,
    defaultColor: "bg-slate-100 text-slate-600",
  },
];

export function LandingAttendance() {
  const container = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Pinning the section to show animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: "top top",
          end: "+=150%",
          scrub: 1,
          pin: true,
          onUpdate: (self) => {
            const progress = self.progress;
            const index = Math.min(
              Math.floor(progress * attSteps.length),
              attSteps.length - 1,
            );
            setActiveStep(index);
          },
        },
      });

      // Simple visual timeline progress
      tl.to(".att-progress-bar", {
        height: "100%",
        ease: "none",
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="attendance"
      ref={container}
      className="h-screen w-full bg-muted/20 flex flex-col justify-center px-4 sm:px-6 lg:px-8 border-y border-border"
    >
      <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row gap-12 items-center">
        {/* Left Concept */}
        <div className="w-full md:w-1/2">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Absensi Akurat dengan Lokasi
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Kehadiran didukung dengan validasi geofencing, memastikan peserta
            berada di tempat penempatan yang telah ditetapkan sebelum
            mengkonfirmasi kehadiran.
          </p>

          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-4">
              Status Pengguna: {attSteps[activeStep]?.label}
            </h3>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                <CheckCircle
                  className={cn(
                    "w-6 h-6 transition-colors duration-300",
                    activeStep >= 2 ? "text-success" : "text-muted-foreground",
                  )}
                />
              </div>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded-full w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded-full w-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right UI Flow */}
        <div className="w-full md:w-1/2 relative h-[400px] flex items-center">
          {/* Timeline line */}
          <div className="absolute left-6 top-10 bottom-10 w-1 bg-border rounded-full overflow-hidden">
            <div className="att-progress-bar w-full bg-primary h-0"></div>
          </div>

          <div className="flex flex-col justify-between h-full relative z-10 w-full pl-0">
            {attSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep >= index;
              const isCurrent = activeStep === index;

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-6 transition-all duration-300",
                    isCurrent
                      ? "scale-105 opacity-100"
                      : isActive
                        ? "opacity-100"
                        : "opacity-40 grayscale",
                  )}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-sm transition-colors duration-300",
                      isActive
                        ? "border-primary bg-background text-primary"
                        : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="bg-card px-4 py-2 border border-border shadow-sm rounded-lg flex-1">
                    <span
                      className={cn(
                        "font-medium",
                        isActive ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {step.label}
                    </span>
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
