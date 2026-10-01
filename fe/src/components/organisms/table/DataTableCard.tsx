'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { TableEmptyState } from '@/components/organisms/table/TableEmptyState';
import type { LucideIcon } from 'lucide-react';

export interface DataTableColumn {
  key?: string;
  label: React.ReactNode;
  className?: string;
}

export interface DataTableCardProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  headerAction?: React.ReactNode;
  columns: DataTableColumn[];
  isEmpty: boolean;
  emptyIcon: LucideIcon;
  emptyTitle?: string;
  emptyMessage: string;
  emptyAction?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * DataTableCard — kerangka standar tabel dalam Card
 * (header judul + deskripsi, empty state, thead, footer opsional).
 */
export function DataTableCard({
  title,
  description,
  headerAction,
  columns,
  isEmpty,
  emptyIcon,
  emptyTitle,
  emptyMessage,
  emptyAction,
  footer,
  children,
}: DataTableCardProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle>{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          {headerAction}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isEmpty ? (
          <TableEmptyState
            icon={emptyIcon}
            title={emptyTitle}
            message={emptyMessage}
            action={emptyAction}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  {columns.map((column) => (
                    <th
                      key={
                        column.key ?? (typeof column.label === 'string' ? column.label : undefined)
                      }
                      className={column.className ?? 'px-6 py-3 font-medium'}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>{children}</tbody>
            </table>
          </div>
        )}
        {isEmpty ? null : footer}
      </CardContent>
    </Card>
  );
}
