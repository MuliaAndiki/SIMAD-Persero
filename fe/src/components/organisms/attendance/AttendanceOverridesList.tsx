'use client';

import { Badge } from '@/components/atoms/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import { formatDateTime } from '@/components/organisms/attendance/attendance-format';
import type { IAttendanceOverride } from '@/types/api/model.type';
import { History } from 'lucide-react';

export type AttendanceOverrideItem = Omit<IAttendanceOverride, 'attendanceId'>;

export interface AttendanceOverridesListProps {
  overrides: AttendanceOverrideItem[];
}

/**
 * AttendanceOverridesList — organism daftar riwayat override status absensi.
 */
export function AttendanceOverridesList({ overrides }: AttendanceOverridesListProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <History className="size-4" />
          Riwayat Override
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-6">
        {overrides.map((override) => (
          <div key={override.id} className="flex flex-col gap-1 rounded-lg border p-3 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{override.previousStatus}</Badge>
              <span className="text-muted-foreground">→</span>
              <Badge>{override.newStatus}</Badge>
              <span className="ml-auto text-xs text-muted-foreground">
                {formatDateTime(override.createdAt)}
              </span>
            </div>
            <p className="text-muted-foreground">{override.reason}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
