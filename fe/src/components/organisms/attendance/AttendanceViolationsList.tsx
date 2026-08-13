'use client';

import { Badge } from '@/components/atoms/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import { formatDateTime } from '@/components/organisms/attendance/attendance-format';
import type { IAttendanceViolation } from '@/types/api/model.type';
import { ShieldAlert } from 'lucide-react';

export type AttendanceViolationItem = Pick<
  IAttendanceViolation,
  'id' | 'severity' | 'description' | 'createdAt'
> & {
  type: string | null;
};

export interface AttendanceViolationsListProps {
  violations: AttendanceViolationItem[];
}

/**
 * AttendanceViolationsList — organism daftar pelanggaran absensi peserta.
 */
export function AttendanceViolationsList({ violations }: AttendanceViolationsListProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="size-4" />
          Pelanggaran
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-6">
        {violations.map((violation) => (
          <div key={violation.id} className="flex flex-col gap-1 rounded-lg border p-3 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="destructive">{violation.type ?? '-'}</Badge>
              <Badge variant="outline">{violation.severity}</Badge>
              <span className="ml-auto text-xs text-muted-foreground">
                {formatDateTime(violation.createdAt)}
              </span>
            </div>
            <p className="text-muted-foreground">{violation.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
