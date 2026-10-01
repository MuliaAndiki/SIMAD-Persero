'use client';

import { RowActionsMenu } from '@/components/organisms/table/RowActionsMenu';
import { formatDate } from '@/utils/string.format';
import { XCircle } from 'lucide-react';

export interface SupervisorAssignmentRow {
  id: string;
  internship?: {
    intern?: { fullName?: string | null; studentNumber?: string | null } | null;
    department?: { name?: string | null } | null;
    actualStartDate?: string | null;
    actualEndDate?: string | null;
    status?: string | null;
  } | null;
}

export interface SupervisorAssignmentsTableProps {
  assignments: SupervisorAssignmentRow[];
  isRemoving?: boolean;
  onRemoveAssignment: (assignmentId: string) => void | Promise<void>;
}

/**
 * SupervisorAssignmentsTable — tabel intern bimbingan per supervisor.
 * Dipakai bersama oleh dialog detail supervisor dan halaman detail supervisor.
 */
export function SupervisorAssignmentsTable({
  assignments,
  isRemoving,
  onRemoveAssignment,
}: SupervisorAssignmentsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase text-muted-foreground">
            <th className="px-4 py-3 font-medium">Intern</th>
            <th className="px-4 py-3 font-medium">Departemen</th>
            <th className="px-4 py-3 font-medium">Periode</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment) => (
            <tr key={assignment.id} className="border-b last:border-0">
              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <span className="font-medium">
                    {assignment.internship?.intern?.fullName ?? '-'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {assignment.internship?.intern?.studentNumber ?? ''}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">{assignment.internship?.department?.name ?? '-'}</td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <span>{formatDate(assignment.internship?.actualStartDate ?? null)}</span>
                  <span className="text-xs text-muted-foreground">
                    s.d. {formatDate(assignment.internship?.actualEndDate ?? null)}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">{assignment.internship?.status ?? '-'}</td>
              <td className="px-4 py-3 text-right">
                <RowActionsMenu
                  contentClassName="w-40"
                  items={[
                    {
                      key: 'remove',
                      label: 'Lepas',
                      icon: XCircle,
                      variant: 'destructive',
                      disabled: isRemoving,
                      onSelect: () => {
                        void onRemoveAssignment(assignment.id);
                      },
                    },
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
