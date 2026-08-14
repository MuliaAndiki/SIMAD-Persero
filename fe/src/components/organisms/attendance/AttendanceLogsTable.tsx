'use client';

import { Badge } from '@/components/atoms/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import { formatDateTime } from '@/components/organisms/attendance/attendance-format';
import type { AttendanceLog } from '@/types/api/attendance.types';
import { Clock3, MapPin } from 'lucide-react';

export interface AttendanceLogsTableProps {
  logs: AttendanceLog[];
}

/**
 * AttendanceLogsTable — organism tabel log check-in/check-out peserta.
 */
export function AttendanceLogsTable({ logs }: AttendanceLogsTableProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Clock3 className="size-4" />
          Log Check-in / Check-out
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="px-6 py-3 font-medium">Aksi</th>
                <th className="px-6 py-3 font-medium">Waktu</th>
                <th className="px-6 py-3 font-medium">Lokasi</th>
                <th className="px-6 py-3 font-medium">Jarak</th>
                <th className="px-6 py-3 font-medium">Akurasi</th>
                <th className="px-6 py-3 font-medium">Geofence</th>
                <th className="px-6 py-3 font-medium">Fake GPS</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b last:border-0">
                  <td className="px-6 py-4">
                    <Badge variant={log.action === 'CHECK_IN' ? 'default' : 'secondary'}>
                      {log.action === 'CHECK_IN' ? 'Check-in' : 'Check-out'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">{formatDateTime(log.createdAt)}</td>
                  <td className="px-6 py-4">
                    {log.latitude !== null && log.longitude !== null ? (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5 text-muted-foreground" />
                        {log.latitude.toFixed(6)}, {log.longitude.toFixed(6)}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {log.distanceMeter !== null ? `${Math.round(log.distanceMeter)} m` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    {log.accuracyMeter !== null ? `${Math.round(log.accuracyMeter)} m` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    {log.insideGeofence ? (
                      <Badge className="bg-green-600 hover:bg-green-700">Dalam</Badge>
                    ) : (
                      <Badge variant="destructive">Luar</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {log.fakeGpsDetected ? (
                      <Badge variant="destructive">Terindikasi</Badge>
                    ) : (
                      <Badge variant="outline">Tidak</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
