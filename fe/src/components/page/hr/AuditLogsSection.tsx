'use client';

import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { AuditLogDetailDialog } from '@/components/organisms/audit-log/AuditLogDetailDialog';
import { AuditLogTable } from '@/components/organisms/audit-log/AuditLogTable';
import type { AuditLogResponse } from '@/types/api/auditLog.types';
import { AlertCircle } from 'lucide-react';

export interface AuditLogsSectionState {
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  logs: AuditLogResponse[];
  moduleFilter: string;
  actionFilter: string;
  detail: AuditLogResponse | null;
}

export interface AuditLogsSectionActions {
  onModuleChange: (module: string) => void;
  onActionChange: (action: string) => void;
  onSelectLog: (id: string) => void;
  onCloseDetail: () => void;
  onRetry: () => void;
}

export interface AuditLogsSectionProps {
  state: AuditLogsSectionState;
  actions: AuditLogsSectionActions;
}

export function AuditLogsSection({ state, actions }: AuditLogsSectionProps) {
  const moduleOptions = [...new Set(state.logs.map((log) => log.module))].sort((a, b) =>
    a.localeCompare(b),
  );
  const actionOptions = [...new Set(state.logs.map((log) => log.action))].sort((a, b) =>
    a.localeCompare(b),
  );

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
        <p className="text-sm text-muted-foreground">
          Jejak aktivitas pengguna di seluruh modul sistem.
        </p>
      </header>

      {state.isPending ? (
        <Card className="h-64" />
      ) : state.isError ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="flex flex-col gap-1 text-destructive">
            <p className="font-semibold">Gagal memuat audit log</p>
            <p className="opacity-90">{state.errorMessage}</p>
            <Button variant="outline" size="sm" className="mt-1 w-fit" onClick={actions.onRetry}>
              Coba Lagi
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Select
              value={state.moduleFilter || 'all'}
              onValueChange={(value) => actions.onModuleChange(value === 'all' ? '' : value)}
            >
              <SelectTrigger className="w-full md:w-52">
                <SelectValue placeholder="Semua Modul" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Modul</SelectItem>
                {moduleOptions.map((module) => (
                  <SelectItem key={module} value={module}>
                    {module}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={state.actionFilter || 'all'}
              onValueChange={(value) => actions.onActionChange(value === 'all' ? '' : value)}
            >
              <SelectTrigger className="w-full md:w-52">
                <SelectValue placeholder="Semua Aksi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Aksi</SelectItem>
                {actionOptions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <AuditLogTable logs={state.logs} onSelectLog={actions.onSelectLog} />
        </>
      )}

      <AuditLogDetailDialog log={state.detail} onClose={actions.onCloseDetail} />
    </section>
  );
}
