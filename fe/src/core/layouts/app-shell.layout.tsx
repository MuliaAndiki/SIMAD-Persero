'use client';

import { Button, SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/atoms';
import { PWAInstallDialog } from '@/components/pwa/PWAInstallDialog';
import { AppSidebar } from '@/core/components/app-sidebar';
import { BottomNav } from '@/core/components/bottom-nav';
import LanguageDropdown from '@/core/components/language.dropdown';
import NotificationDropdown from '@/core/components/notification.dropdown';
import ThemeToggle from '@/core/components/theme-toggle';
import { Download } from 'lucide-react';
import Image from 'next/image';

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * AppShell — layout utama area privat SIMAD.
 *
 * Responsif untuk desktop & mobile sekaligus:
 * - Desktop (md+): sidebar ikon/label (AppSidebar) + header sticky.
 * - Mobile (<md): sidebar disembunyikan, diganti BottomNav + logo di header.
 *
 * Navigasi dibaca dari `SIDEBAR_MENU` (single source of truth) sehingga
 * sidebar dan bottom nav selalu sinkron.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider defaultOpen>
      {/* Sidebar hanya tampil di desktop (md+); mobile memakai BottomNav */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      <SidebarInset className="min-h-screen">
        {/* Header sticky */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border/50 bg-background/75 px-4 backdrop-blur-md md:h-20 md:px-6">
          {/* Logo mobile (md:hidden) */}
          <div className="flex items-center gap-2 md:hidden">
            <Image
              src="/images/logos.png"
              alt="SIMAD"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            <span className="text-base font-bold leading-tight text-foreground">SIMAD</span>
          </div>

          <SidebarTrigger className="hidden md:inline-flex" />

          {/* Aksi header */}
          <div className="ml-auto flex items-center gap-3">
            {/* <PWAInstallDialog
              trigger={
                <Button
                  variant="ghost"
                  className="p-0"
                  aria-label="Install SIMAD"
                >
                  <Download className="h-5 w-5" />
                </Button>
              }
            /> */}
            <ThemeToggle />
            <LanguageDropdown />
            <NotificationDropdown />
            <Image
              src="/avatars/2.png"
              alt="Avatar"
              height={38}
              width={38}
              className="rounded-full border border-border/60"
            />
          </div>
        </header>

        {/* Konten halaman */}
        <div className="flex-1 overflow-auto pb-32 md:pb-6">
          <div className="mx-auto w-full max-w-full p-4 md:p-8">{children}</div>
        </div>
      </SidebarInset>

      {/* Bottom navigation mobile */}
      <BottomNav />
    </SidebarProvider>
  );
}
