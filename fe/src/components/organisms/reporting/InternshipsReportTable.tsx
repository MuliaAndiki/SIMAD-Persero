'use client';

import { Badge } from '@/components/atoms/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { ReportError } from '@/components/organisms/reporting/ReportError';
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
  if (isPending) return <Card className="h-64" />;
  if (isError) return <ReportError message={errorMessage} onRetry={onRetry} />;

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Laporan Peserta Magang</CardTitle>
        <CardDescription>{rows.length} peserta magang</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <Users className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Belum ada peserta magang.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Intern</th>
                  <th className="px-6 py-3 font-medium">Instansi</th>
                  <th className="px-6 py-3 font-medium">Jurusan</th>
                  <th className="px-6 py-3 font-medium">Departemen</th>
                  <th className="px-6 py-3 font-medium">Supervisor</th>
                  <th className="px-6 py-3 font-medium">Periode</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={`${row.intern}-${row.email}`}
                    className="border-b last:border-0 hover:bg-muted/40"
                  >
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
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
