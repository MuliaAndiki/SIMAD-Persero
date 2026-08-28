'use client';

import { SupervisorAttendanceSection } from '@/components/page/supervisor/SupervisorAttendanceSection';
import { useApi } from '@/hooks/useService/useApi';
import AttendanceService from '@/services/api/attendance.service';
import { toast } from 'sonner';

export default function SupervisorAttendanceContainer() {
  const api = useApi();
  const supervisorQuery = api.attendance.query.supervisor();
  const overrideMutation = api.attendance.mutate.override();

  const handleExport = async () => {
    try {
      toast.loading('Mengekspor laporan absensi...', { id: 'export-att' });
      await AttendanceService.DownloadExcel({});
      toast.success('Laporan absensi berhasil diunduh', { id: 'export-att' });
    } catch (error) {
      console.error('Failed to export attendance:', error);
      toast.error('Gagal mengekspor laporan absensi', { id: 'export-att' });
    }
  };

  const handleOverrideSubmit = async (
    attendanceId: string,
    data: { status: 'PRESENT' | 'INVALID'; reason: string },
  ) => {
    await overrideMutation.mutateAsync({
      params: { attendanceId },
      body: data,
    });
  };

  return (
    <SupervisorAttendanceSection
      state={{
        isPending: supervisorQuery.isPending,
        isOverridePending: overrideMutation.isPending,
        isError: supervisorQuery.isError,
        errorMessage: supervisorQuery.error?.message,
        rows: supervisorQuery.data ?? [],
      }}
      actions={{
        onExport: handleExport,
        onOverrideSubmit: handleOverrideSubmit,
      }}
    />
  );
}
