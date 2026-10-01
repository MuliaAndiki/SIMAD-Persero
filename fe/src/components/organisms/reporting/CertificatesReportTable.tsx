'use client';

import { Card } from '@/components/atoms/card';
import { TableLoader } from '@/components/atoms/loading';
import { ReportError } from '@/components/organisms/reporting/ReportError';
import { DataTableCard } from '@/components/organisms/table/DataTableCard';
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
  if (isPending)
    return (
      <Card>
        <TableLoader label="Memuat laporan sertifikat..." />
      </Card>
    );
  if (isError) return <ReportError message={errorMessage} onRetry={onRetry} />;

  return (
    <DataTableCard
      title="Laporan Sertifikat"
      description={`${rows.length} sertifikat diterbitkan`}
      columns={[
        { label: 'No. Sertifikat' },
        { label: 'Intern' },
        { label: 'Departemen' },
        { label: 'Diterbitkan' },
        { label: 'Oleh' },
      ]}
      isEmpty={rows.length === 0}
      emptyIcon={FileCheck2}
      emptyMessage="Belum ada sertifikat yang diterbitkan."
    >
      {rows.map((row) => (
        <tr key={row.certificateNumber} className="border-b last:border-0 hover:bg-muted/40">
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
    </DataTableCard>
  );
}
