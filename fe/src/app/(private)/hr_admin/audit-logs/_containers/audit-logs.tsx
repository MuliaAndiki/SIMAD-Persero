'use client';

import { AuditLogsSection } from '@/components/page/hr/AuditLogsSection';
import { useApi } from '@/hooks/useService/useApi';
import { useCallback, useState } from 'react';

/**
 * Container halaman Audit Log (HR Admin) — orchestration layer.
 *
 * Menarik daftar audit log (GET /audit-logs) dengan filter modul & aksi,
 * serta detail log (GET /audit-logs/:auditId) saat dipilih.
 * Section hanya presentasi — menerima `state` + `actions`.
 */
export default function HrAuditLogsContainer() {
  const api = useApi();

  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const list = api.auditLog.query.list({
    module: moduleFilter || undefined,
    action: actionFilter || undefined,
    limit: 100,
  });
  const detail = api.auditLog.query.detail(
    { auditId: selectedId ?? '' },
    { enabled: Boolean(selectedId) },
  );

  const handleRetry = useCallback(() => {
    void list.refetch();
  }, [list]);

  return (
    <AuditLogsSection
      state={{
        isPending: list.isPending,
        isError: list.isError,
        errorMessage: list.error?.message,
        logs: list.data ?? [],
        moduleFilter,
        actionFilter,
        detail: detail.data ?? null,
      }}
      actions={{
        onModuleChange: setModuleFilter,
        onActionChange: setActionFilter,
        onSelectLog: setSelectedId,
        onCloseDetail: () => setSelectedId(null),
        onRetry: handleRetry,
      }}
    />
  );
}
