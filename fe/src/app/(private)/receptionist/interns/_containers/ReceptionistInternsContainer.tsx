'use client';

import { ReceptionistInternsSection } from '@/components/page/receptionist/ReceptionistInternsSection';
import { useApi } from '@/hooks/useService/useApi';
import type { InternshipResponse } from '@/types/api/internship.types';
import { useMemo, useState } from 'react';

/**
 * Format local date YYYY-MM-DD dengan offset hari.
 */
function getLocalDateString(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function ReceptionistInternsContainer() {
  const api = useApi();
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [dateFilterMode, setDateFilterMode] = useState<'all' | 'today' | 'yesterday' | 'custom'>(
    'all',
  );
  const [customDate, setCustomDate] = useState('');

  const { data, isPending, isFetching, isError, error, refetch } = api.internship.query.list({
    limit: 100,
  });
  const departmentsQuery = api.department.query.list();

  const internshipsList: InternshipResponse[] = useMemo(() => {
    const list = data?.data ?? (Array.isArray(data) ? data : []);
    return (list as InternshipResponse[]) ?? [];
  }, [data]);

  // Resolusi string tanggal aktif (YYYY-MM-DD)
  const activeDate = useMemo(() => {
    if (dateFilterMode === 'today') return getLocalDateString(0);
    if (dateFilterMode === 'yesterday') return getLocalDateString(-1);
    if (dateFilterMode === 'custom') return customDate;
    return '';
  }, [dateFilterMode, customDate]);

  // Daftar departemen gabungan (dari API departemen & fallback data magang)
  const departments = useMemo(() => {
    const map = new Map<string, { id: string; name: string; code?: string }>();
    if (departmentsQuery.data && Array.isArray(departmentsQuery.data)) {
      for (const d of departmentsQuery.data) {
        map.set(d.id, { id: d.id, name: d.name, code: d.code });
      }
    }
    for (const item of internshipsList) {
      if (item.department?.id && item.department?.name) {
        map.set(item.department.id, {
          id: item.department.id,
          name: item.department.name,
          code: item.department.code,
        });
      }
    }
    return Array.from(map.values());
  }, [departmentsQuery.data, internshipsList]);

  // Filter magang berdasarkan departemen, tanggal/hari, dan pencarian kata kunci
  const filteredInternships = useMemo(() => {
    const list = internshipsList;
    const queryLower = search.trim().toLowerCase();

    // Deteksi pencarian kata kunci khusus hari ("kemarin" / "hari ini")
    let keywordDate: string | null = null;
    if (queryLower === 'kemarin') {
      keywordDate = getLocalDateString(-1);
    } else if (queryLower === 'hari ini') {
      keywordDate = getLocalDateString(0);
    }

    const effectiveDate = activeDate || keywordDate;

    return list.filter((internship) => {
      // 1. Filter Departemen
      if (
        departmentFilter &&
        internship.departmentId !== departmentFilter &&
        internship.department?.id !== departmentFilter
      ) {
        return false;
      }

      // 2. Filter Tanggal / Hari (misal: kemarin, hari ini, tanggal tertentu)
      if (effectiveDate) {
        const startStr = internship.actualStartDate ? internship.actualStartDate.slice(0, 10) : '';
        const endStr = internship.actualEndDate ? internship.actualEndDate.slice(0, 10) : '';
        const hasAttendanceOnDate = internship.attendances?.some(
          (a) => a.attendanceDate.slice(0, 10) === effectiveDate,
        );
        const isInRange =
          (!startStr || startStr <= effectiveDate) && (!endStr || endStr >= effectiveDate);

        // Jika tidak masuk rentang periode magang dan tidak ada absensi pada hari tersebut, lewati
        if (!hasAttendanceOnDate && !isInRange) {
          return false;
        }
      } else {
        // Jika mode "Semua Hari", tampilkan peserta magang yang aktif
        if (internship.status !== 'ACTIVE') {
          return false;
        }
      }

      // 3. Pencarian Kata Kunci Multi-field
      if (!queryLower || queryLower === 'kemarin' || queryLower === 'hari ini') {
        return true;
      }

      const name = internship.internProfile?.user?.fullName?.toLowerCase() ?? '';
      const email = internship.internProfile?.user?.email?.toLowerCase() ?? '';
      const nim = internship.internProfile?.studentNumber?.toLowerCase() ?? '';
      const deptName = internship.department?.name?.toLowerCase() ?? '';
      const deptCode = internship.department?.code?.toLowerCase() ?? '';
      const officeName = internship.officeLocation?.name?.toLowerCase() ?? '';
      const instName = internship.internProfile?.institution?.name?.toLowerCase() ?? '';
      const majorName = internship.internProfile?.major?.name?.toLowerCase() ?? '';
      const supervisorName =
        internship.supervisorAssignments?.[0]?.supervisor?.fullName?.toLowerCase() ?? '';

      const matchesAttendanceDate = internship.attendances?.some((a) => {
        const d = a.attendanceDate.slice(0, 10);
        return d.includes(queryLower);
      });

      return (
        name.includes(queryLower) ||
        email.includes(queryLower) ||
        nim.includes(queryLower) ||
        deptName.includes(queryLower) ||
        deptCode.includes(queryLower) ||
        officeName.includes(queryLower) ||
        instName.includes(queryLower) ||
        majorName.includes(queryLower) ||
        supervisorName.includes(queryLower) ||
        Boolean(matchesAttendanceDate)
      );
    });
  }, [internshipsList, departmentFilter, activeDate, search]);

  const handleResetFilters = () => {
    setSearch('');
    setDepartmentFilter('');
    setDateFilterMode('all');
    setCustomDate('');
  };

  return (
    <ReceptionistInternsSection
      interns={filteredInternships}
      isPending={isPending}
      isFetching={isFetching}
      isError={isError}
      errorMessage={error?.message}
      searchQuery={search}
      departmentFilter={departmentFilter}
      dateFilterMode={dateFilterMode}
      customDate={customDate}
      activeDate={activeDate}
      departments={departments}
      onSearch={setSearch}
      onDepartmentChange={setDepartmentFilter}
      onDateFilterModeChange={setDateFilterMode}
      onCustomDateChange={setCustomDate}
      onResetFilters={handleResetFilters}
      onRefresh={refetch}
    />
  );
}
