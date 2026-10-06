'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import ThemeToggle from '@/core/components/theme-toggle';
import { useTheme } from '@/core/providers/theme.provider';
import { usePushNotification } from '@/hooks/usePushNotification';
import { cn } from '@/utils/classname';
import {
  BellOff,
  BellRing,
  CheckCircle2,
  Loader2,
  Moon,
  Palette,
  Sliders,
  Smartphone,
  Sun,
  Zap,
} from 'lucide-react';

export function AppSettingsCard() {
  const { theme, toggleTheme } = useTheme();
  const push = usePushNotification();

  return (
    <Card className="border-border/70 shadow-2xs">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Sliders className="size-4 text-primary" />
          Preferensi Aplikasi & Perangkat
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Sesuaikan tema tampilan sistem dan kelola notifikasi push ke perangkat Anda.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* ─── 1. Pengaturan Tema Tampilan ────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Palette className="size-4.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Tema Tampilan</span>
                <Badge variant="outline" className="text-[10px] font-medium capitalize">
                  Mode {theme === 'dark' ? 'Gelap' : 'Terang'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Ganti tampilan visual antarmuka SIMAD antara mode terang dan gelap.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <div className="flex items-center rounded-lg border border-border/70 p-0.5 bg-muted/40">
              <Button
                type="button"
                variant={theme === 'light' ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'h-7 text-xs px-2.5 gap-1.5 cursor-pointer',
                  theme === 'light' ? 'shadow-2xs' : 'text-muted-foreground hover:text-foreground',
                )}
                onClick={() => theme === 'dark' && toggleTheme()}
              >
                <Sun className="size-3.5" />
                <span>Terang</span>
              </Button>
              <Button
                type="button"
                variant={theme === 'dark' ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'h-7 text-xs px-2.5 gap-1.5 cursor-pointer',
                  theme === 'dark' ? 'shadow-2xs' : 'text-muted-foreground hover:text-foreground',
                )}
                onClick={() => theme === 'light' && toggleTheme()}
              >
                <Moon className="size-3.5" />
                <span>Gelap</span>
              </Button>
            </div>
          </div>
        </div>

        {/* ─── 2. Pengaturan Notifikasi Push HP (PWA) ─────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-3.5">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-lg',
                push.isSubscribed
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              <Smartphone className="size-4.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-foreground">
                  Notifikasi Push HP
                </span>
                {push.isSubscribed ? (
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Terhubung & Aktif
                  </span>
                ) : push.permission === 'denied' ? (
                  <span className="inline-flex items-center gap-1 rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive border border-destructive/20">
                    Diblokir Browser
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Belum Diaktifkan
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {push.isSubscribed
                  ? 'Perangkat ini menerima notifikasi kehadiran, penilaian, sertifikat, dan siaran langsung ke HP.'
                  : push.permission === 'denied'
                    ? 'Izin notifikasi diblokir di browser ini. Mohon izinkan notifikasi pada setelan peramban.'
                    : 'Terima pembaruan status magang dan pengumuman instan langsung di status bar HP Anda.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {push.isSubscribed ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5 border-border/70 bg-background text-foreground hover:bg-muted cursor-pointer"
                  onClick={push.sendTestNotification}
                >
                  <Zap className="size-3.5 text-amber-500" />
                  <span>Uji Notifikasi</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground hover:text-destructive cursor-pointer gap-1"
                  disabled={push.isLoading}
                  onClick={push.unsubscribe}
                >
                  <BellOff className="size-3.5" />
                  <span>Nonaktifkan</span>
                </Button>
              </>
            ) : (
              <Button
                type="button"
                size="sm"
                className="h-8 text-xs gap-1.5 cursor-pointer shadow-2xs"
                disabled={push.isLoading || push.permission === 'denied' || !push.isSupported}
                onClick={push.subscribe}
              >
                {push.isLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <BellRing className="size-3.5" />
                )}
                <span>Aktifkan Notifikasi HP</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
