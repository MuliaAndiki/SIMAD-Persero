import { PhantomSkeleton } from '@/components/atoms/PhantomSkeleton';
import { Card, CardContent } from '@/components/atoms/card';
import { CertificateActions } from '@/components/organisms/certificate/CertificateActions';
import { CertificateEmpty } from '@/components/organisms/certificate/CertificateEmpty';
import { CertificatePreview } from '@/components/organisms/certificate/CertificatePreview';
import type { CertificateResponse } from '@/types/api/certificate.types';
import { AlertTriangle } from 'lucide-react';

export interface CertificateSectionState {
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  certificates: CertificateResponse[];
  internshipStatus?: string | null;
  isDownloading?: boolean;
}

export interface CertificateSectionService {
  onDownload: (certificateId: string, certificateNumber: string) => void;
}

export interface CertificateSectionProps {
  state: CertificateSectionState;
  service: CertificateSectionService;
}

function CertificateLoading() {
  return (
    <PhantomSkeleton loading>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="h-96 rounded-lg bg-muted" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="h-64 rounded-lg bg-muted" />
          </CardContent>
        </Card>
      </div>
    </PhantomSkeleton>
  );
}

function CertificateError({ message }: { message?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
      <div className="flex flex-col gap-1">
        <p className="font-medium text-destructive">Gagal memuat sertifikat</p>
        <p className="text-muted-foreground">
          {message ?? 'Silakan muat ulang halaman untuk mencoba lagi.'}
        </p>
      </div>
    </div>
  );
}

export function CertificateSection({ state, service }: CertificateSectionProps) {
  const certificate = state.certificates[0]; // Get first (should only be one per intern)

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">E-Certificate</h1>
        <p className="text-muted-foreground">
          Unduh dan verifikasi sertifikat kelulusan magang Anda secara digital.
        </p>
      </header>

      {state.isPending ? (
        <CertificateLoading />
      ) : state.isError ? (
        <CertificateError message={state.errorMessage} />
      ) : !certificate ? (
        <CertificateEmpty internshipStatus={state.internshipStatus} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Certificate Preview */}
          <div>
            <CertificatePreview certificate={certificate} />
          </div>

          {/* Right Column: Actions */}
          <div>
            <CertificateActions
              certificateId={certificate.id}
              certificateNumber={certificate.certificateNumber}
              verificationToken={certificate.verificationToken}
              isDownloading={state.isDownloading}
              onDownload={service.onDownload}
            />
          </div>
        </div>
      )}
    </section>
  );
}
