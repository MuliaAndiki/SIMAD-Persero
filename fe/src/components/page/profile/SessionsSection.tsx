'use client';

import { PhantomSkeleton } from '@/components/atoms/PhantomSkeleton';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import type { AuthSession } from '@/types/api/auth.types';
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  Key,
  Laptop,
  Loader2,
  Lock,
  LogOut,
  Monitor,
  ShieldCheck,
  Smartphone,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

export interface SessionsSectionState {
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  sessions: AuthSession[];
  isRevoking: boolean;
  role?: string | null;
}

export interface SessionsSectionService {
  onRevokeSession: (sessionId: string) => void;
  onLogoutAll: () => void;
}

export interface SessionsSectionProps {
  state: SessionsSectionState;
  service: SessionsSectionService;
}

/** Base path halaman profil berdasarkan role. */
function profileBasePath(role?: string | null): string {
  switch (role?.toUpperCase()) {
    case 'HR_ADMIN':
      return '/hr_admin/profile';
    case 'SUPERVISOR':
      return '/supervisor/profile';
    default:
      return '/intern/profile';
  }
}

/** Formatter tanggal dalam Bahasa Indonesia. */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function SessionsSection({ state, service }: SessionsSectionProps) {
  const basePath = profileBasePath(state.role);

  if (state.isPending) {
    return (
      <PhantomSkeleton loading>
        <div className="flex flex-col gap-6">
          <div className="h-8 w-40 rounded-md bg-muted" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="h-24" />
            <Card className="h-24" />
            <Card className="h-24" />
          </div>
          <Card className="h-64" />
        </div>
      </PhantomSkeleton>
    );
  }

  if (state.isError) {
    return (
      <div className="flex flex-col gap-4">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href={basePath}>
            <ArrowLeft className="mr-1.5 size-4" />
            Kembali ke Profil
          </Link>
        </Button>
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-foreground">Gagal memuat sesi aktif</span>
            <span className="text-muted-foreground">
              {state.errorMessage || 'Terjadi kesalahan saat mengambil data sesi.'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const currentSession = state.sessions.find((s) => s.isCurrent);
  const otherSessionsCount = state.sessions.filter((s) => !s.isCurrent).length;

  return (
    <section className="flex flex-col gap-6">
      {/* Top Nav & Header */}
      <div className="flex flex-col gap-3">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit text-muted-foreground hover:text-foreground">
            <Link href={basePath}>
              <ArrowLeft className="mr-1.5 size-4" />
              Kembali ke Profil
            </Link>
          </Button>
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Perangkat & Sesi Aktif
          </h1>
          <p className="text-sm text-muted-foreground">
            Pantau dan kelola sesi login akun Anda di berbagai perangkat dan browser.
          </p>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Laptop className="size-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-foreground">{state.sessions.length}</span>
              <span className="text-xs text-muted-foreground">Total Sesi Aktif</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Sistem Terlindungi</span>
              <span className="text-xs text-muted-foreground">Enkripsi Token JWT</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="size-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground">Sesi Ini Login:</span>
              <span className="text-xs font-semibold text-foreground">
                {currentSession ? formatDate(currentSession.createdAt) : '-'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions List */}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Monitor className="size-5 text-primary" />
              Daftar Perangkat Terhubung
            </CardTitle>
            <CardDescription>
              Semua browser yang memiliki akses login aktif ke akun SIMAD ini.
            </CardDescription>
          </div>
          {otherSessionsCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto text-destructive border-destructive/20 hover:bg-destructive/10"
              onClick={service.onLogoutAll}
              disabled={state.isRevoking}
            >
              {state.isRevoking ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 size-4" />
              )}
              Keluar Semua Perangkat Lain ({otherSessionsCount})
            </Button>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          {state.sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <ShieldCheck className="size-12 text-muted-foreground/50 mb-2" />
              <p className="text-sm font-medium text-foreground">Tidak Ada Sesi Aktif</p>
              <p className="text-xs text-muted-foreground">Tidak ada sesi login lain yang ditemukan.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {state.sessions.map((session) => (
                <div
                  key={session.id}
                  className={`group relative flex flex-col gap-3 sm:flex-row sm:items-center justify-between rounded-xl border p-4 transition-all duration-200 ${
                    session.isCurrent
                      ? 'border-primary/40 bg-primary/5 shadow-sm'
                      : 'bg-card hover:bg-muted/30 hover:border-muted-foreground/20'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                        session.isCurrent
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Laptop className="size-5" />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-foreground text-sm sm:text-base">
                          Sesi ID: {session.id.slice(0, 12)}…
                        </span>
                        {session.isCurrent ? (
                          <Badge variant="default" className="gap-1 bg-emerald-600 hover:bg-emerald-600 text-white text-[11px] px-2 py-0.5">
                            <span className="size-1.5 rounded-full bg-white animate-pulse" />
                            Sesi Saat Ini (Perangkat Ini)
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[11px] text-muted-foreground">
                            Perangkat Lain
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          <strong>Dibuat:</strong> {formatDate(session.createdAt)}
                        </span>
                        <span>
                          <strong>Kedaluwarsa:</strong> {formatDate(session.expiresAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!session.isCurrent && (
                    <div className="flex items-center justify-end border-t pt-3 sm:border-t-0 sm:pt-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full sm:w-auto text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => service.onRevokeSession(session.id)}
                        disabled={state.isRevoking}
                      >
                        {state.isRevoking ? (
                          <Loader2 className="mr-1.5 size-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-1.5 size-4" />
                        )}
                        Cabut Akses Sesi
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Guidance Card */}
      <Card className="bg-muted/20 border-dashed">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="size-4 text-primary" />
            Tips Keamanan Akun SIMAD
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <Key className="size-4 shrink-0 text-primary mt-0.5" />
              <span>Ganti kata sandi Anda secara berkala jika menyadari ada aktivitas mencurigakan.</span>
            </li>
            <li className="flex items-start gap-2">
              <LogOut className="size-4 shrink-0 text-primary mt-0.5" />
              <span>Gunakan tombol <strong>"Keluar Semua Perangkat Lain"</strong> apabila merasa ada yang menggunakan akun Anda dari perangkat lain.</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
