'use client';

import { Badge } from '@/components/atoms/badge';
import { Card } from '@/components/atoms/card';
import { TableLoader } from '@/components/atoms/loading';
import { ReportError } from '@/components/organisms/reporting/ReportError';
import { DataTableCard } from '@/components/organisms/table/DataTableCard';
import type { InternshipReportRow } from '@/types/api/reporting.types';
import { formatDate } from '@/utils/string.format';
import { Users } from 'lucide-react';

export interface InternshipsReportTableProps {
  rows: InternshipReportRow[];
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
}

/**
 * InternshipsReportTable — organism tabel laporan peserta magang (tab Peserta Magang).
 */
export function InternshipsReportTable({
  rows,
  isPending,
  isError,
  errorMessage,
  onRetry,
}: InternshipsReportTableProps) {
  if (isPending)
    return (
      <Card>
        <TableLoader label="Memuat laporan peserta magang..." />
      </Card>
    );
  if (isError) return <ReportError message={errorMessage} onRetry={onRetry} />;

  return (
    <DataTableCard
      title="Laporan Peserta Magang"
      description={`${rows.length} peserta magang`}
      columns={[
        { label: 'Intern' },
        { label: 'Instansi' },
        { label: 'Jurusan' },
        { label: 'Departemen' },
        { label: 'Supervisor' },
        { label: 'Periode' },
        { label: 'Status' },
      ]}
      isEmpty={rows.length === 0}
      emptyIcon={Users}
      emptyMessage="Belum ada peserta magang."
    >
      {rows.map((row) => (
        <tr key={`${row.intern}-${row.email}`} className="border-b last:border-0 hover:bg-muted/40">
          <td className="px-6 py-4">
            <div className="flex flex-col">
              <span className="font-medium">{row.intern}</span>
              <span className="text-xs text-muted-foreground">
                {row.studentNumber || row.email}
              </span>
            </div>
          </td>
          <td className="px-6 py-4">{row.institution}</td>
          <td className="px-6 py-4">{row.major}</td>
          <td className="px-6 py-4">{row.department}</td>
          <td className="px-6 py-4">{row.supervisor}</td>
          <td className="px-6 py-4">
            <div className="flex flex-col gap-0.5">
              <span>{formatDate(row.actualStartDate)}</span>
              <span className="text-xs text-muted-foreground">
                s.d. {formatDate(row.actualEndDate)}
              </span>
            </div>
          </td>
          <td className="px-6 py-4">
            <Badge variant="secondary">{row.status}</Badge>
          </td>
        </tr>
      ))}
    </DataTableCard>
  );
}
