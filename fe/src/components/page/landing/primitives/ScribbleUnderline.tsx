'use client';

import { cn } from '@/utils/classname';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useEffect, useRef } from 'react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface ScribbleUnderlineProps {
  className?: string;
  colorClassName?: string;
  strokeWidth?: number;
  duration?: number;
  delay?: number;
  triggerOnScroll?: boolean;
}

/**
 * Hand-drawn wavy underline SVG with GSAP stroke-dashoffset drawing animation.
 * Represents academic editorial annotation (e.g., professor or mentor underlining a key term).
 */
export function ScribbleUnderline({
  className,
  colorClassName = 'text-warning',
  strokeWidth = 3.5,
  duration = 0.9,
  delay = 0.1,
  triggerOnScroll = true,
}: ScribbleUnderlineProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    const svg = svgRef.current;
    if (!path || !svg) return;

    const length = path.getTotalLength();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      path.style.strokeDasharray = 'none';
      path.style.strokeDashoffset = '0';
      return;
    }

    // Set initial stroke dash properties
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;

    const ctx = gsap.context(() => {
      const animProps = {
        strokeDashoffset: 0,
        duration,
        delay,
        ease: 'power2.out',
      };

      if (triggerOnScroll) {
        gsap.to(path, {
          ...animProps,
          scrollTrigger: {
            trigger: svg,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        });
      } else {
        gsap.to(path, animProps);
      }
    }, svg);

    return () => ctx.revert();
  }, [duration, delay, triggerOnScroll]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 260 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn('pointer-events-none select-none overflow-visible', colorClassName, className)}
    >
      {/* Hand-drawn organic wave path */}
      <path
        ref={pathRef}
        d="M 4 14 C 45 19, 90 8, 140 16 C 180 22, 220 9, 256 12"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
