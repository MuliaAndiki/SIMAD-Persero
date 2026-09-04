import { Card, CardContent } from '@/components/atoms/card';
import { Award, Clock, CheckCircle2 } from 'lucide-react';

export interface CertificateEmptyProps {
  internshipStatus?: string | null;
}

/**
 * Empty state for when no certificate is available yet.
 * Shows different messages based on internship status.
 */
export function CertificateEmpty({ internshipStatus }: CertificateEmptyProps) {
  const isCompleted = internshipStatus === 'COMPLETED';
  const isCertificateGenerated = internshipStatus === 'CERTIFICATE_GENERATED';
  const isActive = internshipStatus === 'ACTIVE';

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <div className="mb-6 rounded-full bg-muted p-4">
          {isCompleted || isCertificateGenerated ? (
            <CheckCircle2 className="size-12 text-muted-foreground" />
          ) : isActive ? (
            <Clock className="size-12 text-muted-foreground" />
          ) : (
            <Award className="size-12 text-muted-foreground" />
          )}
        </div>

        <h3 className="text-lg font-semibold mb-2">
          {isCertificateGenerated
            ? 'Sertifikat Sedang Diproses'
            : isCompleted
              ? 'Sertifikat Belum Diterbitkan'
              : isActive
                ? 'Program Magang Masih Berjalan'
                : 'Belum Ada Sertifikat'}
        </h3>

        <p className="text-sm text-muted-foreground max-w-md">
          {isCertificateGenerated ? (
            <>
              Sertifikat Anda sedang dalam proses penerbitan. Mohon tunggu atau hubungi HR Admin
              untuk informasi lebih lanjut.
            </>
          ) : isCompleted ? (
            <>
              Program magang Anda telah selesai. Sertifikat akan segera diterbitkan oleh HR Admin.
              Anda akan menerima notifikasi ketika sertifikat sudah tersedia.
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
