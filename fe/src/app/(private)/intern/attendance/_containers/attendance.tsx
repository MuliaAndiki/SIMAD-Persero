'use client';

import { AttendanceLocationDialog } from '@/components/organisms/attendance/AttendanceLocationDialog';
import { AttendanceSection } from '@/components/page/attendance/AttendanceSection';
import { useApi } from '@/hooks/useService/useApi';
import type { AttendanceOfficeInfo, AttendanceSettingInfo } from '@/types/api/attendance.types';
import type { InternshipResponse } from '@/types/api/internship.types';
import { useMemo, useState } from 'react';

/** deviceId stabil per browser (untuk deteksi perangkat di backend). */
function getOrCreateDeviceId(): string {
  const KEY = 'simad-device-id';
  try {
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id =
        typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

/**
 * Container halaman absensi intern (GET /attendance/today, /summary, /me;
 * POST /attendance/check-in, /check-out).
 *
 * Logika, state, & API ada di sini; AttendanceSection & AttendanceLocationDialog hanya presentasi.
 */
export default function AttendanceContainer() {
  const api = useApi();

  const now = new Date();
  const me = api.auth.query.me();
  const today = api.attendance.query.today();
  const summary = api.attendance.query.summary({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });
  const history = api.attendance.query.my({ page: 1, limit: 10 });
  const internship = api.internship.query.my();

  const checkIn = api.attendance.mutate.checkIn();
  const checkOut = api.attendance.mutate.checkOut();

  // Dialog State
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    type: 'CHECK_IN' | 'CHECK_OUT';
  }>({
    open: false,
    type: 'CHECK_IN',
  });

  const internshipData: InternshipResponse | null = useMemo(() => {
    if (!internship.data) return null;
    return Array.isArray(internship.data)
      ? ((internship.data as InternshipResponse[])[0] ?? null)
      : (internship.data as InternshipResponse);
  }, [internship.data]);

  // Ekstraksi data lokasi kantor penempatan
  const officeInfo: AttendanceOfficeInfo | null = useMemo(() => {
    if (today.data?.office) {
      return today.data.office;
    }
    const loc = internshipData?.officeLocation;
    if (!loc) return null;
    return {
      id: loc.id,
      name: loc.name,
      address: loc.address ?? null,
      latitude: loc.latitude != null ? Number(loc.latitude) : null,
      longitude: loc.longitude != null ? Number(loc.longitude) : null,
      radiusMeter: loc.radiusMeter ?? 100,
    };
  }, [today.data?.office, internshipData?.officeLocation]);

  // Ekstraksi aturan jadwal absensi kantor
  const settingInfo: AttendanceSettingInfo | null = useMemo(() => {
    if (today.data?.setting) {
      return today.data.setting;
    }
    const s = internshipData?.officeLocation?.attendanceSettings?.[0];
    if (!s) return null;
    return {
      checkInStart: s.checkInStart,
      checkInEnd: s.checkInEnd,
      checkOutStart: s.checkOutStart,
      checkOutEnd: s.checkOutEnd,
      lateAfter: s.lateAfter,
    };
  }, [today.data?.setting, internshipData?.officeLocation?.attendanceSettings]);

  const handleOpenCheckIn = () => {
    setDialogState({ open: true, type: 'CHECK_IN' });
  };

  const handleOpenCheckOut = () => {
    setDialogState({ open: true, type: 'CHECK_OUT' });
  };

  const handleCloseDialog = () => {
    setDialogState((prev) => ({ ...prev, open: false }));
  };

  const handleSubmitAttendance = async (coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  }) => {
    if (dialogState.type === 'CHECK_IN') {
      checkIn.mutate(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          deviceId: getOrCreateDeviceId(),
          fakeGpsDetected: false,
        },
        {
          onSuccess: () => {
            handleCloseDialog();
          },
        },
      );
    } else {
      checkOut.mutate(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        },
        {
          onSuccess: () => {
            handleCloseDialog();
          },
        },
      );
    }
  };

  return (
    <>
      <AttendanceSection
        state={{
          isPending: today.isPending || summary.isPending || history.isPending,
          isError: today.isError || summary.isError || history.isError,
          errorMessage: today.error?.message ?? summary.error?.message ?? history.error?.message,
          userName: me.data?.fullName,
          today: today.data ?? null,
          summary: summary.data ?? null,
          history: history.data ?? [],
          isCheckInPending: checkIn.isPending,
          isCheckOutPending: checkOut.isPending,
          office: officeInfo,
          setting: settingInfo,
        }}
        service={{ onCheckIn: handleOpenCheckIn, onCheckOut: handleOpenCheckOut }}
      />

      <AttendanceLocationDialog
        open={dialogState.open}
        type={dialogState.type}
        office={officeInfo}
        setting={settingInfo}
        isSubmitting={checkIn.isPending || checkOut.isPending}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitAttendance}
      />
    </>
  );
}
