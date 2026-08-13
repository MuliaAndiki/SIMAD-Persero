'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { ReportError } from '@/components/organisms/reporting/ReportError';
import type { CertificateReportRow } from '@/types/api/reporting.types';
import { formatDate } from '@/utils/string.format';
import { FileCheck2 } from 'lucide-react';

export interface CertificatesReportTableProps {
  rows: CertificateReportRow[];
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
}

/**
 * CertificatesReportTable — organism tabel laporan sertifikat (tab Sertifikat).
 */
export function CertificatesReportTable({
  rows,
  isPending,
  isError,
  errorMessage,
  onRetry,
}: CertificatesReportTableProps) {
  if (isPending) return <Card className="h-64" />;
  if (isError) return <ReportError message={errorMessage} onRetry={onRetry} />;

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Laporan Sertifikat</CardTitle>
        <CardDescription>{rows.length} sertifikat diterbitkan</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <FileCheck2 className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Belum ada sertifikat yang diterbitkan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="px-6 py-3 font-medium">No. Sertifikat</th>
                  <th className="px-6 py-3 font-medium">Intern</th>
                  <th className="px-6 py-3 font-medium">Departemen</th>
                  <th className="px-6 py-3 font-medium">Diterbitkan</th>
                  <th className="px-6 py-3 font-medium">Oleh</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.certificateNumber}
                    className="border-b last:border-0 hover:bg-muted/40"
                  >
                    <td className="px-6 py-4 font-medium">{row.certificateNumber}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{row.intern}</span>
                        <span className="text-xs text-muted-foreground">{row.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{row.department}</td>
                    <td className="px-6 py-4">{formatDate(row.generatedAt)}</td>
                    <td className="px-6 py-4">{row.generatedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
