'use client';

import { useMemo, useState } from 'react';

import { InternshipsSection } from '@/components/page/hr/InternshipsSection';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useApi } from '@/hooks/useService/useApi';

/**
 * Container halaman Magang (HR Admin) — Pusat Kontrol Magang.
 */
export default function HrInternshipsContainer() {
  const api = useApi();
  const ns = useAppNameSpace();

  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Queries
  const list = api.internship.query.list();
  const departments = api.department.query.list();
  const offices = api.office.query.list();
  const supervisors = api.supervisor.query.list();

  // Mutations
  const startMutation = api.internship.mutate.start();
  const finishMutation = api.internship.mutate.finish();
  const extendMutation = api.internship.mutate.extend();
  const changeDeptMutation = api.internship.mutate.changeDepartment();
  const assignSuperMutation = api.internship.mutate.assignSupervisor();
  const archiveMutation = api.internship.mutate.archive();
  const generateCertMutation = api.certificate.mutate.generate();

  const isActionPending =
    startMutation.isPending ||
    finishMutation.isPending ||
    extendMutation.isPending ||
    changeDeptMutation.isPending ||
    assignSuperMutation.isPending ||
    archiveMutation.isPending ||
    generateCertMutation.isPending;

  const filteredInternships = useMemo(() => {
    const keywordLower = keyword.trim().toLowerCase();
    return (list.data ?? []).filter((internship) => {
      if (statusFilter && internship.status !== statusFilter) return false;
      if (!keywordLower) return true;

      const name = internship.internProfile?.user.fullName?.toLowerCase() ?? '';
      const email = internship.internProfile?.user.email?.toLowerCase() ?? '';
      const nim = internship.internProfile?.studentNumber?.toLowerCase() ?? '';
      return (
        name.includes(keywordLower) || email.includes(keywordLower) || nim.includes(keywordLower)
      );
    });
  }, [list.data, keyword, statusFilter]);

  // Handlers
  const handleStart = async (id: string) => {
    const confirmed = await ns.alert.confirm({
      title: 'Mulai Magang?',
      deskripsi: 'Status magang akan diubah menjadi Aktif.',
      icon: 'question',
      confirmButtonText: 'Ya, Mulai',
    });
    if (!confirmed) return;
    await startMutation.mutateAsync({ internshipId: id });
  };

  const handleFinish = async (id: string) => {
    const confirmed = await ns.alert.confirm({
      title: 'Selesaikan Magang?',
      deskripsi: 'Magang peserta ini akan ditandai Selesai dan dapat diterbitkan sertifikat.',
      icon: 'question',
      confirmButtonText: 'Ya, Selesaikan',
    });
    if (!confirmed) return;
    await finishMutation.mutateAsync({ internshipId: id });
  };

  const handleExtendSubmit = async (id: string, data: { newEndDate: string; reason: string }) => {
    await extendMutation.mutateAsync({
      internshipId: id,
      newEndDate: data.newEndDate,
      reason: data.reason,
    });
  };

  const handleChangeDepartmentSubmit = async (
    id: string,
    data: { departmentId: string; officeLocationId: string },
  ) => {
    await changeDeptMutation.mutateAsync({
      internshipId: id,
      departmentId: data.departmentId,
      officeLocationId: data.officeLocationId,
    });
  };

  const handleAssignSupervisorSubmit = async (id: string, data: { supervisorId: string }) => {
    await assignSuperMutation.mutateAsync({
      internshipId: id,
      supervisorId: data.supervisorId,
    });
  };

  const handleGenerateCertSubmit = async (internshipId: string) => {
    await generateCertMutation.mutateAsync({ internshipId });
  };

  const handleArchive = async (id: string) => {
    const confirmed = await ns.alert.confirm({
      title: 'Arsipkan Magang?',
      deskripsi: 'Data magang peserta ini akan diarsipkan.',
      icon: 'warning',
      confirmButtonText: 'Ya, Arsipkan',
    });
    if (!confirmed) return;
    await archiveMutation.mutateAsync({ internshipId: id });
  };

  return (
    <InternshipsSection
      state={{
        isPending: list.isPending,
        isActionPending,
        isError: list.isError,
        errorMessage: list.error?.message,
        internships: filteredInternships,
        statusFilter,
        keyword,
        departments: departments.data ?? [],
        offices: offices.data ?? [],
        supervisors: supervisors.data ?? [],
      }}
      actions={{
        onStatusChange: setStatusFilter,
        onKeywordChange: setKeyword,
        onSearch: () => {},
        onStart: handleStart,
        onFinish: handleFinish,
        onExtendSubmit: handleExtendSubmit,
        onChangeDepartmentSubmit: handleChangeDepartmentSubmit,
        onAssignSupervisorSubmit: handleAssignSupervisorSubmit,
        onGenerateCertSubmit: handleGenerateCertSubmit,
        onArchive: handleArchive,
      }}
    />
  );
}
