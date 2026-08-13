'use client';

import { SupervisorsSection } from '@/components/page/hr/SupervisorsSection';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useApi } from '@/hooks/useService/useApi';
import { useCallback, useState } from 'react';

/**
 * Container halaman Supervisor (HR Admin) — orchestration layer.
 *
 * Mengelola list supervisor (GET /supervisors), detail + assignment
 * (GET /supervisors/:id), assign intern (POST /supervisors/:id/assign),
 * dan lepas assignment (DELETE /supervisors/:id/assignments/:assignmentId).
 * Opsi intern berasal dari aplikasi berstatus APPROVED yang memiliki
 * internship ref. Nilai `internshipId` (object state form assign, §19.4)
 * dimiliki container; dialog assign mengonsumsi state + handler generik.
 */
export default function HrSupervisorsContainer() {
  const api = useApi();
  const ns = useAppNameSpace();

  const [keyword, setKeyword] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [internshipId, setInternshipId] = useState('');

  const list = api.supervisor.query.list({
    keyword: keyword || undefined,
    limit: 100,
  });
  const detail = api.supervisor.query.detail(
    { supervisorId: selectedId ?? '' },
    { enabled: Boolean(selectedId) },
  );
  const approvedApplications = api.application.query.list({
    status: 'APPROVED',
    limit: 100,
  });

  const assign = api.supervisor.mutate.assign();
  const removeAssignment = api.supervisor.mutate.removeAssignment();

  const handleOpenAssign = useCallback(() => {
    setInternshipId('');
    setAssignOpen(true);
  }, []);

  const handleCloseAssign = useCallback(() => {
    setInternshipId('');
    setAssignOpen(false);
  }, []);

  const handleSubmitAssign = useCallback(async () => {
    if (!selectedId || !internshipId) return;
    await assign.mutateAsync({
      params: { supervisorId: selectedId },
      body: { internshipId },
    });
    setAssignOpen(false);
    setInternshipId('');
  }, [assign, internshipId, selectedId]);

  const handleRemoveAssignment = useCallback(
    async (assignmentId: string) => {
      if (!selectedId) return;
      const confirmed = await ns.alert.confirm({
        title: 'Lepas Penugasan?',
        icon: 'question',
        deskripsi:
          'Intern akan dilepas dari bimbingan supervisor ini. Supervisor dapat di-assign ulang kapan saja.',
        confirmButtonText: 'Lepas',
      });
      if (!confirmed) return;
      await removeAssignment.mutateAsync({
        supervisorId: selectedId,
        assignmentId,
      });
    },
    [ns.alert, removeAssignment, selectedId],
  );

  return (
    <SupervisorsSection
      state={{
        isPending: list.isPending,
        isError: list.isError,
        errorMessage: list.error?.message,
        supervisors: list.data ?? [],
        keyword,
        detail: detail.data ?? null,
        isDetailPending: detail.isPending,
        isAssigning: assign.isPending,
        isRemoving: removeAssignment.isPending,
        approvedApplications: approvedApplications.data ?? [],
        assignOpen,
        internshipId,
      }}
      actions={{
        onKeywordChange: setKeyword,
        onSearch: () => {},
        onSelectSupervisor: setSelectedId,
        onCloseDetail: () => setSelectedId(null),
        onOpenAssign: handleOpenAssign,
        onCloseAssign: handleCloseAssign,
        onInternshipIdChange: setInternshipId,
        onSubmitAssign: handleSubmitAssign,
        onRemoveAssignment: handleRemoveAssignment,
      }}
    />
  );
}
