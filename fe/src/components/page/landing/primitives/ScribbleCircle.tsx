'use client';

import { cn } from '@/utils/classname';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type React from 'react';
import { useEffect, useRef } from 'react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface ScribbleCircleProps {
  children?: React.ReactNode;
  className?: string;
  svgClassName?: string;
  colorClassName?: string;
  strokeWidth?: number;
  duration?: number;
  delay?: number;
}

/**
 * Hand-drawn elliptical loop SVG that encircles a word or element.
 * Mimics an academic mentor's circle marker mark.
 */
export function ScribbleCircle({
  children,
  className,
  svgClassName,
  colorClassName = 'text-primary',
  strokeWidth = 2.8,
  duration = 1.0,
  delay = 0.2,
}: ScribbleCircleProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    const container = containerRef.current;
    if (!path || !container) return;

    const length = path.getTotalLength();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      path.style.strokeDasharray = 'none';
      path.style.strokeDashoffset = '0';
      return;
    }

    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;

    const ctx = gsap.context(() => {
      gsap.to(path, {
        strokeDashoffset: 0,
        duration,
        delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    }, container);

    return () => ctx.revert();
  }, [duration, delay]);

  return (
    <span
      ref={containerRef}
      className={cn('relative inline-flex items-center justify-center px-1.5', className)}
    >
      <span className="relative z-10">{children}</span>
      <svg
        viewBox="0 0 160 70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        aria-hidden="true"
        className={cn(
          'pointer-events-none select-none absolute -inset-x-2 -inset-y-1.5 w-[calc(100%+1rem)] h-[calc(100%+0.75rem)] overflow-visible',
          colorClassName,
          svgClassName,
        )}
      >
        {/* Slightly imperfect, organic hand-drawn loop with realistic overlap */}
        <path
          ref={pathRef}
          d="M 25 15 C 60 5, 125 6, 145 22 C 162 36, 150 56, 115 63 C 70 71, 15 65, 8 45 C 2 27, 24 12, 65 9 C 95 7, 138 12, 152 24"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
