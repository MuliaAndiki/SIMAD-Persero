import { Button } from '@/components/atoms';
import { ArrowRight, CheckCircle2, Loader2, RefreshCw, XCircle } from 'lucide-react';

export type VerifyEmailStatus = 'verifying' | 'success' | 'error';

export interface VerifyEmailSectionProps {
  state: {
    status: VerifyEmailStatus;
    message: string;
  };
  service: {
    onRetry: () => void;
    onGoToLogin: () => void;
  };
}

export function VerifyEmailSection({ state, service }: VerifyEmailSectionProps) {
  const { status, message } = state;

  return (
    <section className="flex min-h-screen items-center justify-center bg-muted px-4 py-8">
      <div className="card-glass w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-xl">
        <div className="px-8 py-10">
          <div className="mb-10 text-center">
            <h1 className="mb-2 text-3xl font-bold text-foreground">Verifikasi Email</h1>
            <p className="text-sm text-foreground/60">
              Sistem Informasi Manajemen Magang & Absensi Digital
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 text-center">
            {status === 'verifying' ? (
              <>
                <Loader2 className="h-14 w-14 animate-spin text-primary" />
                <p className="text-sm text-foreground/70">{message}</p>
              </>
            ) : null}

            {status === 'success' ? (
              <>
                <CheckCircle2 className="h-14 w-14 text-emerald-500" />
                <p className="text-base font-semibold text-foreground">
                  Email Berhasil Diverifikasi
                </p>
                <p className="text-sm text-foreground/70">{message}</p>
                <Button className="mt-2 w-full" onClick={service.onGoToLogin}>
                  Lanjut ke Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : null}

            {status === 'error' ? (
              <>
                <XCircle className="h-14 w-14 text-red-500" />
                <p className="text-base font-semibold text-foreground">Verifikasi Gagal</p>
                <p className="text-sm text-foreground/70">{message}</p>
                <div className="mt-2 flex w-full flex-col gap-2">
                  <Button variant="outline" onClick={service.onRetry}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Coba Lagi
                  </Button>
                  <Button variant="ghost" onClick={service.onGoToLogin}>
                    Kembali ke Login
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
