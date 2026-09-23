'use client';

import {
  type DateFilterMode,
  SupervisorAttendanceSection,
} from '@/components/page/supervisor/SupervisorAttendanceSection';
import { useDebounce } from '@/hooks/useDebounce';
import { useApi } from '@/hooks/useService/useApi';
import type { AttendanceSupervisorRow } from '@/types/api/attendance.types';
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

export default function SupervisorAttendanceContainer() {
  const api = useApi();
  const [search, setSearch] = useState('');
  const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>('today');
  const [customDate, setCustomDate] = useState('');

  const debouncedSearch = useDebounce(search, 2000);

  // Resolusi string tanggal aktif (YYYY-MM-DD)
  const activeDate = useMemo(() => {
    const queryLower = debouncedSearch.trim().toLowerCase();
    if (queryLower === 'kemarin') return getLocalDateString(-1);
    if (queryLower === 'hari ini') return getLocalDateString(0);

    if (dateFilterMode === 'today') return getLocalDateString(0);
    if (dateFilterMode === 'yesterday') return getLocalDateString(-1);
    if (dateFilterMode === 'custom') return customDate;
    return getLocalDateString(0);
  }, [debouncedSearch, dateFilterMode, customDate]);

  // Panggil query attendance supervisor berdasarkan tanggal aktif
  const supervisorQuery = api.attendance.query.supervisor(
    activeDate ? { date: activeDate } : undefined,
  );
  const overrideMutation = api.attendance.mutate.override();

  const allRows: AttendanceSupervisorRow[] = useMemo(() => {
    return supervisorQuery.data ?? [];
  }, [supervisorQuery.data]);

  // Filter kata kunci pencarian (nama, email, departemen, status)
  const filteredRows = useMemo(() => {
    const queryLower = debouncedSearch.trim().toLowerCase();
    if (!queryLower || queryLower === 'kemarin' || queryLower === 'hari ini') {
      return allRows;
    }

    return allRows.filter((row) => {
      const internName = row.internship.intern?.fullName?.toLowerCase() ?? '';
      const email = row.internship.intern?.email?.toLowerCase() ?? '';
      const deptName = row.internship.department?.name?.toLowerCase() ?? '';
      const attStatus = row.todayAttendance?.attendanceStatus?.toLowerCase() ?? '';

      // Terjemahan status bahasa Indonesia
      const indonesianStatus =
        attStatus === 'present'
          ? 'hadir'
          : attStatus === 'late'
            ? 'terlambat'
            : attStatus === 'invalid' || attStatus === 'absent'
              ? 'tidak hadir invalid'
              : 'belum absen';

      return (
        internName.includes(queryLower) ||
        email.includes(queryLower) ||
        deptName.includes(queryLower) ||
        attStatus.includes(queryLower) ||
        indonesianStatus.includes(queryLower)
      );
    });
  }, [allRows, debouncedSearch]);

  const handleResetFilters = () => {
    setSearch('');
    setDateFilterMode('today');
    setCustomDate('');
  };

  const handleOverrideSubmit = async (
    attendanceId: string,
    data: { type: 'CHECK_IN' | 'CHECK_OUT' | 'INVALID'; time?: string; reason: string },
  ) => {
    await overrideMutation.mutateAsync({
      params: { attendanceId },
      body: data,
    });
  };

  const isSearching = supervisorQuery.isFetching || search !== debouncedSearch;

  return (
    <SupervisorAttendanceSection
      state={{
        isPending: supervisorQuery.isPending,
        isFetching: isSearching,
        isOverridePending: overrideMutation.isPending,
        isError: supervisorQuery.isError,
        errorMessage: supervisorQuery.error?.message,
        rows: filteredRows,
        allRowsCount: allRows.length,
        searchQuery: search,
        dateFilterMode,
        customDate,
        activeDate,
      }}
      actions={{
        onSearch: setSearch,
        onDateFilterModeChange: (mode) => {
          setDateFilterMode(mode);
          if (mode !== 'custom') {
            setCustomDate('');
          }
        },
        onCustomDateChange: setCustomDate,
        onResetFilters: handleResetFilters,
        onRefresh: () => supervisorQuery.refetch(),
        onOverrideSubmit: handleOverrideSubmit,
      }}
    />
  );
}
