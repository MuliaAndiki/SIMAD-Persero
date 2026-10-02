'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import { TableLoader } from '@/components/atoms/loading';
import { ReportError } from '@/components/organisms/reporting/ReportError';
import { DataTableCard } from '@/components/organisms/table/DataTableCard';
import type { InternshipReportRow } from '@/types/api/reporting.types';
import { formatDate } from '@/utils/string.format';
import { RotateCcw, Search, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';

export interface InternshipsReportTableProps {
  rows: InternshipReportRow[];
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
}

const STATUS_TAGS = [
  { value: 'ALL', label: 'Semua' },
  { value: 'IN_PROGRESS', label: 'Aktif (In Progress)' },
  { value: 'COMPLETED', label: 'Selesai (Completed)' },
  { value: 'APPROVED', label: 'Disetujui' },
  { value: 'PENDING', label: 'Pending' },
];

/**
 * InternshipsReportTable — organism tabel laporan peserta magang (tab Peserta Magang)
 * dilengkapi dengan fitur pencarian dan filter tag status.
 */
export function InternshipsReportTable({
  rows,
  isPending,
  isError,
  errorMessage,
  onRetry,
}: InternshipsReportTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Filter baris data berdasarkan pencarian dan tag status
  const filteredRows = useMemo(() => {
    let result = rows;

    if (selectedStatus !== 'ALL') {
      result = result.filter(
        (row) => row.status?.toUpperCase() === selectedStatus.toUpperCase(),
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((row) => {
        const intern = row.intern?.toLowerCase() ?? '';
        const email = row.email?.toLowerCase() ?? '';
        const studentNumber = row.studentNumber?.toLowerCase() ?? '';
        const inst = row.institution?.toLowerCase() ?? '';
        const major = row.major?.toLowerCase() ?? '';
        const dept = row.department?.toLowerCase() ?? '';
        const office = row.office?.toLowerCase() ?? '';
        const supervisor = row.supervisor?.toLowerCase() ?? '';
        return (
          intern.includes(q) ||
          email.includes(q) ||
          studentNumber.includes(q) ||
          inst.includes(q) ||
          major.includes(q) ||
          dept.includes(q) ||
          office.includes(q) ||
          supervisor.includes(q)
        );
      });
    }

    return result;
  }, [rows, selectedStatus, searchQuery]);

  if (isPending)
    return (
      <Card>
        <TableLoader label="Memuat laporan peserta magang..." />
      </Card>
    );
  if (isError) return <ReportError message={errorMessage} onRetry={onRetry} />;

  return (
    <div className="flex flex-col gap-4">
      {/* ─── Toolbar Pencarian & Tag Status ─── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-xl border shadow-xs">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, NIM, universitas, jurusan, departemen, supervisor..."
            className="pl-9 pr-8 h-9 text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Tag Filter Status */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground mr-1">Status:</span>
          {STATUS_TAGS.map((tag) => {
            const isActive = selectedStatus === tag.value;
            return (
              <button
                type="button"
                key={tag.value}
                onClick={() => setSelectedStatus(tag.value)}
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {tag.label}
              </button>
            );
          })}

          {(searchQuery || selectedStatus !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('ALL');
              }}
              className="h-7 text-xs text-muted-foreground gap-1 px-2"
            >
              <RotateCcw className="size-3" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* ─── Tabel Peserta Magang ─── */}
      <DataTableCard
        title="Laporan Peserta Magang"
        description={`Menampilkan ${filteredRows.length} dari ${rows.length} peserta magang`}
        columns={[
          { label: 'Intern' },
          { label: 'Instansi' },
          { label: 'Jurusan' },
          { label: 'Departemen' },
          { label: 'Supervisor' },
          { label: 'Periode' },
          { label: 'Status' },
        ]}
        isEmpty={filteredRows.length === 0}
        emptyIcon={Users}
        emptyTitle={searchQuery || selectedStatus !== 'ALL' ? 'Peserta Tidak Ditemukan' : 'Belum Ada Peserta Magang'}
        emptyMessage={
          searchQuery || selectedStatus !== 'ALL'
            ? 'Tidak ada peserta magang yang cocok dengan kata kunci atau filter status yang dipilih.'
            : 'Belum ada data peserta magang yang tercatat di sistem.'
        }
        emptyAction={
          searchQuery || selectedStatus !== 'ALL' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('ALL');
              }}
              className="gap-1.5 text-xs"
            >
              <RotateCcw className="size-3.5" />
              Reset Pencarian
            </Button>
          ) : undefined
        }
      >
        {filteredRows.map((row) => (
          <tr key={`${row.intern}-${row.email}`} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
            <td className="px-6 py-4">
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{row.intern}</span>
                <span className="text-xs text-muted-foreground">
                  {row.studentNumber ? `${row.studentNumber} • ` : ''}
                  {row.email}
                </span>
              </div>
            </td>
            <td className="px-6 py-4 text-muted-foreground">{row.institution}</td>
            <td className="px-6 py-4 text-muted-foreground">{row.major}</td>
            <td className="px-6 py-4">
              <span className="font-medium text-foreground">{row.department}</span>
              {row.office && (
                <span className="text-xs text-muted-foreground block">{row.office}</span>
              )}
            </td>
            <td className="px-6 py-4 text-muted-foreground">{row.supervisor}</td>
            <td className="px-6 py-4">
              <div className="flex flex-col gap-0.5 whitespace-nowrap">
                <span>{formatDate(row.actualStartDate)}</span>
                <span className="text-xs text-muted-foreground">
                  s.d. {formatDate(row.actualEndDate)}
                </span>
              </div>
            </td>
            <td className="px-6 py-4">
              <Badge variant="secondary" className="capitalize text-xs">
                {row.status?.toLowerCase() ?? '-'}
              </Badge>
            </td>
          </tr>
        ))}
      </DataTableCard>
    </div>
  );
}
