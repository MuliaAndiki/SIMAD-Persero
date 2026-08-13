'use client';

import type {
  OverrideAttendanceFormField,
  OverrideAttendanceFormState,
} from '@/components/organisms/attendance/OverrideAttendanceDialog';
import { AttendanceDetailSection } from '@/components/page/supervisor/AttendanceDetailSection';
import { useApi } from '@/hooks/useService/useApi';
import { useParams } from 'next/navigation';
import { useCallback, useState } from 'react';

const EMPTY_OVERRIDE_FORM: OverrideAttendanceFormState = {
  status: 'PRESENT',
  reason: '',
};

/**
 * Container detail absensi supervisor (GET /attendance/:attendanceId +
 * PATCH /attendance/:attendanceId/override). `attendanceId` dibaca dari
 * dynamic route `[attendanceId]`; seluruh feature state (dialog override +
 * object state form, §19.4/§19.5) dimiliki container.
 */
export default function AttendanceDetailContainer() {
  const params = useParams<{ attendanceId: string }>();
  const attendanceId = params.attendanceId;

  const api = useApi();

  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideForm, setOverrideForm] =
    useState<OverrideAttendanceFormState>(EMPTY_OVERRIDE_FORM);

  const detail = api.attendance.query.detail({ attendanceId }, { enabled: Boolean(attendanceId) });
  const override = api.attendance.mutate.override();

  const handleFieldChange = useCallback((field: OverrideAttendanceFormField, value: string) => {
    setOverrideForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleOpenOverride = useCallback(() => {
    setOverrideForm(EMPTY_OVERRIDE_FORM);
    setOverrideOpen(true);
  }, []);

  const handleCloseOverride = useCallback(() => {
    if (override.isPending) return;
    setOverrideOpen(false);
    setOverrideForm(EMPTY_OVERRIDE_FORM);
  }, [override.isPending]);

  const handleSubmitOverride = useCallback(async () => {
    await override.mutateAsync({
      params: { attendanceId },
      body: {
        status: overrideForm.status,
        reason: overrideForm.reason.trim(),
      },
    });
    setOverrideOpen(false);
    setOverrideForm(EMPTY_OVERRIDE_FORM);
  }, [attendanceId, override, overrideForm]);

  return (
    <AttendanceDetailSection
      state={{
        detail: detail.data ?? null,
        isPending: detail.isPending,
        isError: detail.isError,
        errorMessage: detail.error?.message,
        overrideOpen,
        overrideForm,
        isOverridePending: override.isPending,
      }}
      actions={{
        onRetry: () => detail.refetch(),
        onOpenOverride: handleOpenOverride,
        onCloseOverride: handleCloseOverride,
        onOverrideFieldChange: handleFieldChange,
        onSubmitOverride: handleSubmitOverride,
      }}
    />
  );
}
