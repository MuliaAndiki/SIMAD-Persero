'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { ReportError } from '@/components/organisms/reporting/ReportError';
import Api from '@/services/props.service';
import type { AttendanceReportRow } from '@/types/api/reporting.types';
import { formatDate } from '@/utils/string.format';
import { ClipboardCheck, Download } from 'lucide-react';
import { useState } from 'react';

export interface AttendanceReportTableProps {
  rows: AttendanceReportRow[];
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
}

/**
 * AttendanceReportTable — organism tabel laporan absensi (tab Absensi).
 */
export function AttendanceReportTable({
  rows,
  isPending,
  isError,
  errorMessage,
  onRetry,
}: AttendanceReportTableProps) {
  const [isExporting, setIsExporting] = useState(false);

  if (isPending) return <Card className="h-64" />;
  if (isError) return <ReportError message={errorMessage} onRetry={onRetry} />;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await Api.Attendance.DownloadExcel();
    } catch (error) {
      console.error('Failed to export:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b space-y-0">
        <div>
          <CardTitle>Laporan Absensi</CardTitle>
          <CardDescription>{rows.length} catatan absensi</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
          <Download className="mr-2 size-4" />
          {isExporting ? 'Mengekspor...' : 'Export Excel'}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <ClipboardCheck className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Belum ada data absensi.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Tanggal</th>
                  <th className="px-6 py-3 font-medium">Intern</th>
                  <th className="px-6 py-3 font-medium">Instansi</th>
                  <th className="px-6 py-3 font-medium">Departemen</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Masuk</th>
                  <th className="px-6 py-3 font-medium">Keluar</th>
                  <th className="px-6 py-3 font-medium">Durasi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={`${row.date}-${row.intern}-${index}`}
                    className="border-b last:border-0 hover:bg-muted/40"
                  >
                    <td className="px-6 py-4">{formatDate(row.date)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{row.intern}</span>
                        <span className="text-xs text-muted-foreground">
                          {row.studentNumber || row.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{row.institution}</td>
                    <td className="px-6 py-4">{row.department}</td>
                    <td className="px-6 py-4">
                      <Badge variant={row.status === 'PRESENT' ? 'default' : 'secondary'}>
                        {row.status ?? '-'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">{row.checkInAt ?? '-'}</td>
                    <td className="px-6 py-4">{row.checkOutAt ?? '-'}</td>
                    <td className="px-6 py-4">
                      {row.totalWorkMinutes != null ? `${row.totalWorkMinutes} mnt` : '-'}
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
