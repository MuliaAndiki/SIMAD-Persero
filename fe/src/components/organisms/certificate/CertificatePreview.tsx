import { Card, CardContent } from '@/components/atoms/card';
import type { CertificateResponse } from '@/types/api/certificate.types';
import { Award, Calendar, GraduationCap, MapPin } from 'lucide-react';

export interface CertificatePreviewProps {
  certificate: CertificateResponse;
}

/**
 * Visual preview of certificate information.
 * Displays key details in a card format.
 */
export function CertificatePreview({ certificate }: CertificatePreviewProps) {
  const intern = certificate.internship?.intern;
  const institution = certificate.internship?.department;

  return (
    <Card className="overflow-hidden border-2 border-primary/20">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 p-6 border-b">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Award className="size-8 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">Sertifikat Magang</h3>
            <p className="text-sm text-muted-foreground">PT PLN (Persero)</p>
          </div>
        </div>
      </div>

      {/* Certificate Information */}
      <CardContent className="p-6 space-y-6">
        {/* Certificate Number */}
        <div className="flex items-center gap-3 pb-4 border-b">
          <div className="rounded-lg bg-primary/5 p-2">
            <Award className="size-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-0.5">Nomor Sertifikat</p>
            <p className="font-mono font-semibold text-sm">{certificate.certificateNumber}</p>
          </div>
        </div>

        {/* Intern Information */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-2 mt-0.5">
              <GraduationCap className="size-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Nama Peserta</p>
              <p className="font-semibold text-base break-words">{intern?.fullName ?? '-'}</p>
              {intern?.studentNumber && (
                <p className="text-xs text-muted-foreground mt-1">
                  NIM/NPM: {intern.studentNumber}
                </p>
              )}
            </div>
          </div>

          {/* Department */}
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-2 mt-0.5">
              <MapPin className="size-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Bidang/Departemen</p>
              <p className="font-medium break-words">{institution?.name ?? '-'}</p>
            </div>
          </div>

          {/* Internship Period */}
          {certificate.internship?.actualStartDate && certificate.internship?.actualEndDate && (
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-2 mt-0.5">
                <Calendar className="size-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">Periode Magang</p>
                <div className="flex flex-wrap gap-2 items-center text-sm">
                  <span className="font-medium">
                    {new Date(certificate.internship.actualStartDate).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-muted-foreground">—</span>
                  <span className="font-medium">
                    {new Date(certificate.internship.actualEndDate).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Issue Date */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Tanggal Terbit</span>
            <span className="font-medium">
              {new Date(certificate.generatedAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
