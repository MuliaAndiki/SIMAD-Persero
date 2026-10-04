'use client';

import { Button } from '@/components/atoms/button';
import { appConfig } from '@/configs/app.config';
import ThemeToggle from '@/core/components/theme-toggle';
import { cn } from '@/utils/classname';
import { useLenis } from 'lenis/react';
import { ChevronRight, Menu, ShieldCheck, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type React from 'react';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { label: 'Tentang', href: '#about' },
  { label: 'Alur Magang', href: '#lifecycle' },
  { label: 'Panduan', href: '#guide' },
  { label: 'Persyaratan', href: '#requirements' },
  { label: 'Lokasi', href: '#locations' },
  { label: 'Fitur', href: '#features' },
  { label: 'FAQ', href: '#faq' },
];

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState('');
  const lenis = useLenis();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Determine active section based on scroll position
      const sections = NAV_ITEMS.map((item) => item.href.slice(1));
      let currentActive = '';
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 160 && rect.bottom >= 160) {
            currentActive = `#${sectionId}`;
            break;
          }
        }
      }
      if (currentActive) {
        setActiveHash(currentActive);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const scrollToHash = (hash: string) => {
    setMobileMenuOpen(false);
    const target = document.querySelector(hash) as HTMLElement | null;
    if (target) {
      if (lenis) {
        lenis.scrollTo(target, { offset: -90, duration: 1.2 });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      scrollToHash(href);
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-background/90 backdrop-blur-md border-b border-border shadow-xs py-3'
          : 'bg-transparent border-b border-transparent py-4 md:py-5',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & PLN Identity */}
          <Link
            href="/home"
            className="flex items-center gap-3 group focus-visible:outline-ring rounded-lg"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0">
              <Image
                src={appConfig.logo}
                alt="Logo SIMAD PLN"
                width={40}
                height={40}
                priority
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-foreground group-hover:text-primary transition-colors">
                  SIMAD
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground font-medium tracking-tight">
                PT PLN (Persero)
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = activeHash === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={cn(
                    'px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'text-primary font-semibold bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/70',
                  )}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Actions: Verify Sertifikat, Theme, Login, Register */}
          <div className="hidden md:flex items-center gap-2.5">
            <div className="w-px h-5 bg-border mx-0.5" />

            <ThemeToggle />

            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-semibold px-4 h-9 text-foreground hover:text-primary"
              >
                Masuk
              </Button>
            </Link>

            <Link href="/register">
              <Button size="sm" className="text-xs font-semibold px-4 h-9 shadow-xs">
                Daftar Magang
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[65px] z-40 bg-background/95 backdrop-blur-md border-b border-border md:hidden overflow-y-auto animate-enter">
          <div className="px-6 py-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1 border-b border-border pb-4">
              <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-2">
                Navigasi
              </span>
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="flex items-center justify-between py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </a>
              ))}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => scrollToHash('#verify')}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md border border-border text-sm font-medium text-foreground hover:bg-muted cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-primary" />
                Verifikasi Sertifikat
              </button>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="outline" className="w-full text-sm font-medium">
                  Masuk ke SIMAD
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button className="w-full text-sm font-semibold">Daftar Magang Baru</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
