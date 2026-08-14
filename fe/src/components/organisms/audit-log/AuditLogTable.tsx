'use client';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
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
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Riwayat Aktivitas</CardTitle>
        <CardDescription>{logs.length} catatan ditemukan</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <ScrollText className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Belum ada aktivitas yang cocok dengan filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Waktu</th>
                  <th className="px-6 py-3 font-medium">Pengguna</th>
                  <th className="px-6 py-3 font-medium">Modul</th>
                  <th className="px-6 py-3 font-medium">Aksi</th>
                  <th className="px-6 py-3 font-medium">Tabel</th>
                  <th className="px-6 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b transition-colors last:border-0 hover:bg-muted/40"
                  >
                    <td className="px-6 py-4">{formatDate(log.createdAt)}</td>
                    <td className="px-6 py-4">{log.user?.fullName ?? 'Sistem'}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary">{log.module}</Badge>
                    </td>
                    <td className="px-6 py-4">{log.action}</td>
                    <td className="px-6 py-4 text-muted-foreground">{log.tableName}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => onSelectLog(log.id)}>
                        <Eye className="size-4" />
                        Detail
                      </Button>
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
