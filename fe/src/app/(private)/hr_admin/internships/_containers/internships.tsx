'use client';

import { useMemo, useState } from 'react';

import { InternshipsSection } from '@/components/page/hr/InternshipsSection';
import { useAppNameSpace } from '@/hooks/useAppNameSpace';
import { useDebounce } from '@/hooks/useDebounce';
import { useApi } from '@/hooks/useService/useApi';
import type { InternshipStatusValue } from '@/types/api/internship.types';

/**
 * Container halaman Magang (HR Admin) — Pusat Kontrol Magang.
 */
export default function HrInternshipsContainer() {
  const api = useApi();
  const ns = useAppNameSpace();

  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [officeFilter, setOfficeFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [page, setPage] = useState(1);

  const debouncedKeyword = useDebounce(keyword, 2000);

  // Queries dengan server-side filtering & pagination
  const list = api.internship.query.list({
    page,
    limit: 10,
    keyword: debouncedKeyword.trim() || undefined,
    status: (statusFilter as InternshipStatusValue) || undefined,
    officeLocationId: officeFilter || undefined,
    departmentId: departmentFilter || undefined,
  });

  const isSearching = list.isFetching || keyword !== debouncedKeyword;

  const departments = api.department.query.list({ limit: 100 });
  const offices = api.office.query.list({ limit: 100 });
  const supervisors = api.supervisor.query.list({ limit: 100 });

  const internships = list.data?.data ?? (Array.isArray(list.data) ? list.data : []);
  const meta = list.data?.meta as
    | { page?: number; limit?: number; totalPages?: number; total?: number }
    | undefined;

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

  const handleKeywordChange = (val: string) => {
    setKeyword(val);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleOfficeChange = (val: string) => {
    setOfficeFilter(val);
    setPage(1);
  };

  const handleDepartmentChange = (val: string) => {
    setDepartmentFilter(val);
    setPage(1);
  };

  const handleResetFilters = () => {
    setKeyword('');
    setStatusFilter('');
    setOfficeFilter('');
    setDepartmentFilter('');
    setPage(1);
  };

  // Handlers
  const handleStart = async (id: string) => {
    const confirmed = await ns.alert.confirm({
      title: 'Mulai Magang?',
      deskripsi: 'Status magang akan diubah menjadi Aktif.',
      icon: 'question',
      confirmButtonText: 'Ya, Mulai',
    });
    if (!confirmed) return;
    await startMutation.mutateAsync({ id });
  };

  const handleFinish = async (id: string) => {
    const confirmed = await ns.alert.confirm({
      title: 'Selesaikan Magang?',
      deskripsi: 'Magang peserta ini akan ditandai Selesai dan dapat diterbitkan sertifikat.',
      icon: 'question',
      confirmButtonText: 'Ya, Selesaikan',
    });
    if (!confirmed) return;
    await finishMutation.mutateAsync({ id });
  };

  const handleExtendSubmit = async (id: string, data: { newEndDate: string; reason: string }) => {
    await extendMutation.mutateAsync({
      params: { id },
      body: {
        newEndDate: data.newEndDate,
        reason: data.reason,
      },
    });
  };

  const handleChangeDepartmentSubmit = async (
    id: string,
    data: { departmentId: string; officeLocationId: string },
  ) => {
    await changeDeptMutation.mutateAsync({
      params: { id },
      body: {
        departmentId: data.departmentId,
        officeLocationId: data.officeLocationId,
      },
    });
  };

  const handleAssignSupervisorSubmit = async (id: string, data: { supervisorId: string }) => {
    await assignSuperMutation.mutateAsync({
      params: { id },
      body: {
        supervisorId: data.supervisorId,
      },
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
    await archiveMutation.mutateAsync({ id });
  };

  return (
    <InternshipsSection
      state={{
        isPending: list.isPending,
        isFetching: isSearching,
        isActionPending,
        isError: list.isError,
        errorMessage: list.error?.message,
        internships,
        statusFilter,
        officeFilter,
        departmentFilter,
        keyword,
        page,
        totalPages: Number(meta?.totalPages) || 1,
        total: Number(meta?.total) || internships.length,
        departments: departments.data ?? [],
        offices: offices.data ?? [],
        supervisors: supervisors.data ?? [],
      }}
      actions={{
        onStatusChange: handleStatusChange,
        onOfficeChange: handleOfficeChange,
        onDepartmentChange: handleDepartmentChange,
        onResetFilters: handleResetFilters,
        onKeywordChange: handleKeywordChange,
        onPageChange: setPage,
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
