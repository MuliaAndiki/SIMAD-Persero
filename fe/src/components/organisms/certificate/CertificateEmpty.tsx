import { Button } from '@/components/atoms/button';
import { Card, CardContent } from '@/components/atoms/card';
import { Award, CheckCircle2, Clock, Download } from 'lucide-react';

export interface CertificateEmptyProps {
  internshipStatus?: string | null;
  onDownload?: () => void;
  isDownloading?: boolean;
}

/**
 * Empty state for when no certificate is available yet.
 * Shows different messages based on internship status.
 */
export function CertificateEmpty({
  internshipStatus,
  onDownload,
  isDownloading = false,
}: CertificateEmptyProps) {
  const isCompleted = internshipStatus === 'COMPLETED';
  const isCertificateGenerated = internshipStatus === 'CERTIFICATE_GENERATED';
  const isActive = internshipStatus === 'ACTIVE';

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <div className="mb-6 rounded-full bg-muted p-4">
          {isCompleted || isCertificateGenerated ? (
            <CheckCircle2 className="size-12 text-emerald-600" />
          ) : isActive ? (
            <Clock className="size-12 text-muted-foreground" />
          ) : (
            <Award className="size-12 text-muted-foreground" />
          )}
        </div>

        <h3 className="text-xl font-semibold mb-2">
          {isCompleted
            ? 'Program Magang Telah Selesai'
            : isCertificateGenerated
              ? 'Sertifikat Sedang Diproses'
              : isActive
                ? 'Program Magang Masih Berjalan'
                : 'Belum Ada Sertifikat'}
        </h3>

        <p className="text-sm text-muted-foreground max-w-md">
          {isCompleted ? (
            <>
              Selamat! Anda telah menyelesaikan seluruh program magang di PT PLN (Persero).
              Sertifikat resmi Anda sudah siap dan dapat langsung diunduh melalui tombol di bawah
              ini.
            </>
          ) : isCertificateGenerated ? (
            <>
              Sertifikat Anda sedang dalam proses penerbitan. Mohon tunggu atau hubungi HR Admin
              untuk informasi lebih lanjut.
            </>
          ) : isActive ? (
            <>
              Sertifikat akan tersedia setelah Anda menyelesaikan seluruh program magang. Terus
              semangat dan selesaikan program dengan baik!
            </>
          ) : (
            <>
              Sertifikat magang belum tersedia. Pastikan Anda telah menyelesaikan program magang
              dengan baik untuk mendapatkan sertifikat.
            </>
          )}
        </p>

        {isCompleted && onDownload && (
          <div className="mt-6">
            <Button
              onClick={onDownload}
              disabled={isDownloading}
              size="lg"
              className="gap-2 px-8 font-medium shadow-sm"
            >
              {isDownloading ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Menyiapkan Sertifikat...</span>
                </>
              ) : (
                <>
                  <Download className="size-4" />
                  <span>Download Sertifikat</span>
                </>
              )}
            </Button>
          </div>
        )}

        {/* Status Badge */}
        {internshipStatus && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-xs font-medium">
            <div
              className={`size-2 rounded-full ${
                isCertificateGenerated
                  ? 'bg-green-500'
                  : isCompleted
                    ? 'bg-blue-500'
                    : isActive
                      ? 'bg-amber-500'
                      : 'bg-gray-500'
              }`}
            />
            Status: {internshipStatus.replace(/_/g, ' ')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
