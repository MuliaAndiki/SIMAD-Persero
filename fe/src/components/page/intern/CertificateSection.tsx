import { PhantomSkeleton } from '@/components/atoms/PhantomSkeleton';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import type { CertificateResponse } from '@/types/api/certificate.types';
import { AlertTriangle, Award, Download } from 'lucide-react';

export interface CertificateSectionState {
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  certificates: CertificateResponse[];
  internshipStatus?: string | null;
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
      <Card>
        <CardContent className="p-6">
          <div className="h-24 rounded-lg bg-muted" />
        </CardContent>
      </Card>
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
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">E-Certificate</h1>
        <p className="text-sm text-muted-foreground">
          Unduh sertifikat kelulusan magang Anda di sini.
        </p>
      </header>

      {state.isPending ? (
        <CertificateLoading />
      ) : state.isError ? (
        <CertificateError message={state.errorMessage} />
      ) : state.certificates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 rounded-full bg-muted p-3">
              <Award className="size-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Belum ada sertifikat yang diterbitkan.</p>
            {state.internshipStatus !== 'CERTIFICATE_GENERATED' ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Sertifikat baru bisa didapatkan setelah program magang berstatus selesai .
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                Silakan hubungi HR Admin jika status magang sudah selesai.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {state.certificates.map((cert) => (
            <Card key={cert.id} className="flex flex-col overflow-hidden">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <Award className="size-4 text-primary" />
                    Sertifikat Magang
                  </span>
                </CardTitle>
                <CardDescription>No: {cert.certificateNumber}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 p-4">
                <div className="flex flex-col gap-1 text-sm">
                  <span className="text-muted-foreground">Diterbitkan pada:</span>
                  <span className="font-medium">
                    {new Date(cert.generatedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <Button
                  onClick={() => service.onDownload(cert.id, cert.certificateNumber)}
                  className="w-full mt-auto"
                >
                  <Download className="mr-2 size-4" /> Unduh PDF
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
