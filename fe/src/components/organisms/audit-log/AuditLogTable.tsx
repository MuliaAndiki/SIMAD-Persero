'use client';

import { Badge } from '@/components/atoms/badge';
import { DataTableCard } from '@/components/organisms/table/DataTableCard';
import { RowActionsMenu } from '@/components/organisms/table/RowActionsMenu';
import type { AuditLogResponse } from '@/types/api/auditLog.types';
import { formatDate } from '@/utils/string.format';
import { Eye, ScrollText } from 'lucide-react';

export interface AuditLogTableProps {
  logs: AuditLogResponse[];
  onSelectLog: (id: string) => void;
}

/**
 * AuditLogTable — organism tabel riwayat aktivitas audit log.
 */
export function AuditLogTable({ logs, onSelectLog }: AuditLogTableProps) {
  return (
    <DataTableCard
      title="Riwayat Aktivitas"
      description={`${logs.length} catatan ditemukan`}
      columns={[
        { label: 'Waktu' },
        { label: 'Pengguna' },
        { label: 'Modul' },
        { label: 'Aksi' },
        { label: 'Tabel' },
        { label: 'Aksi', className: 'px-6 py-3 text-right font-medium' },
      ]}
      isEmpty={logs.length === 0}
      emptyIcon={ScrollText}
      emptyMessage="Belum ada aktivitas yang cocok dengan filter."
    >
      {logs.map((log) => (
        <tr key={log.id} className="border-b transition-colors last:border-0 hover:bg-muted/40">
          <td className="px-6 py-4">{formatDate(log.createdAt)}</td>
          <td className="px-6 py-4">{log.user?.fullName ?? 'Sistem'}</td>
          <td className="px-6 py-4">
            <Badge variant="secondary">{log.module}</Badge>
          </td>
          <td className="px-6 py-4">{log.action}</td>
          <td className="px-6 py-4 text-muted-foreground">{log.tableName}</td>
          <td className="px-6 py-4 text-right">
            <RowActionsMenu
              items={[
                {
                  key: 'detail',
                  label: 'Detail',
                  icon: Eye,
                  onSelect: () => onSelectLog(log.id),
                },
              ]}
            />
          </td>
        </tr>
      ))}
    </DataTableCard>
  );
}
