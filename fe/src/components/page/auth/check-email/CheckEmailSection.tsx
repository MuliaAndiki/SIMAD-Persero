import { Button } from '@/components/atoms';
import { ArrowLeft, Loader2, MailCheck, RefreshCw, TriangleAlert } from 'lucide-react';

export interface CheckEmailSectionProps {
  state: {
    email: string;
    isResending: boolean;
  };
  service: {
    onResend: () => void;
    onGoToLogin: () => void;
  };
}

export function CheckEmailSection({ state, service }: CheckEmailSectionProps) {
  const { email, isResending } = state;

  return (
    <section className="flex min-h-screen items-center justify-center bg-muted px-4 py-8">
      <div className="card-glass w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-xl">
        <div className="px-8 py-10">
          <div className="mb-10 text-center">
            <h1 className="mb-2 text-3xl font-bold text-foreground">Periksa Surel Anda</h1>
            <p className="text-sm text-foreground/60">
              Sistem Informasi Manajemen Magang & Absensi Digital
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 text-center">
            <MailCheck className="h-14 w-14 text-primary" />
            <p className="text-base font-semibold text-foreground">
              Tautan verifikasi telah dikirim
            </p>
            <p className="text-sm text-foreground/70">
              {email ? (
                <>
                  Kami mengirim tautan verifikasi ke <strong>{email}</strong>. Klik tautan tersebut
                  untuk mengaktifkan akun Anda.
                </>
              ) : (
                'Kami mengirim tautan verifikasi ke surel Anda. Klik tautan tersebut untuk mengaktifkan akun Anda.'
              )}
            </p>

            <div className="flex w-full items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-left">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <p className="text-xs text-foreground/80">
                Tidak menemukan surelnya? Periksa juga folder <strong>SPAM</strong> atau{' '}
                <strong>Promosi</strong> agar tidak kelewat.
              </p>
            </div>

            <div className="mt-2 flex w-full flex-col gap-2">
              <Button onClick={service.onResend} disabled={isResending}>
                {isResending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {isResending ? 'Mengirim ulang...' : 'Kirim Ulang Surel'}
              </Button>
              <Button variant="ghost" onClick={service.onGoToLogin}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Masuk
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
