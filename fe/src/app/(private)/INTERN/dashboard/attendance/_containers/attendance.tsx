"use client";

import { AttendanceSection } from "@/components/page/attendance/AttendanceSection";
import { useAppNameSpace } from "@/hooks/useAppNameSpace";
import { useApi } from "@/hooks/useService/useApi";

/**
 * Ambil posisi GPS browser (promise).
 * Menolak dengan pesan Indonesia yang ramah pengguna sesuai kode error.
 */
function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      reject(new Error("Browser tidak mendukung geolokasi."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (err) => {
        const messages: Record<number, string> = {
          1: "Izin lokasi ditolak. Izinkan akses lokasi lalu coba lagi.",
          2: "Posisi tidak tersedia. Periksa sinyal GPS lalu coba lagi.",
          3: "Waktu permintaan lokasi habis. Coba lagi.",
        };
        reject(new Error(messages[err.code] ?? err.message));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  });
}

/** deviceId stabil per browser (untuk deteksi perangkat di backend). */
function getOrCreateDeviceId(): string {
  const KEY = "simad-device-id";
  try {
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id =
        typeof crypto.randomUUID === "function"
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
 * Logika, state, & API ada di sini; AttendanceSection hanya presentasi.
 */
export default function AttendanceContainer() {
  const api = useApi();
  const ns = useAppNameSpace();

  const now = new Date();
  const me = api.auth.query.me();
  const today = api.attendance.query.today();
  const summary = api.attendance.query.summary({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });
  const history = api.attendance.query.my({ page: 1, limit: 10 });
  const checkIn = api.attendance.mutate.checkIn();
  const checkOut = api.attendance.mutate.checkOut();

  const handleCheckIn = async () => {
    try {
      const pos = await getCurrentPosition();
      checkIn.mutate({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        deviceId: getOrCreateDeviceId(),
        fakeGpsDetected: false,
      });
    } catch (err) {
      ns.alert.toast({
        title: "Gagal mendapatkan lokasi",
        message:
          err instanceof Error ? err.message : "Aktifkan GPS lalu coba lagi.",
        icon: "error",
      });
    }
  };

  const handleCheckOut = async () => {
    const confirmed = await ns.alert.confirm({
      title: "Konfirmasi Check-out",
      icon: "question",
      deskripsi:
        "Pastikan Anda sudah selesai bekerja hari ini dan masih berada di area kantor penempatan.",
      confirmButtonText: "Ya, Check-out",
    });
    if (!confirmed) return;

    try {
      const pos = await getCurrentPosition();
      checkOut.mutate({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      });
    } catch (err) {
      ns.alert.toast({
        title: "Gagal mendapatkan lokasi",
        message:
          err instanceof Error ? err.message : "Aktifkan GPS lalu coba lagi.",
        icon: "error",
      });
    }
  };

  return (
    <AttendanceSection
      state={{
        isPending: today.isPending || summary.isPending || history.isPending,
        isError: today.isError || summary.isError || history.isError,
        errorMessage:
          today.error?.message ??
          summary.error?.message ??
          history.error?.message,
        userName: me.data?.fullName,
        today: today.data ?? null,
        summary: summary.data ?? null,
        history: history.data ?? [],
        isCheckInPending: checkIn.isPending,
        isCheckOutPending: checkOut.isPending,
      }}
      service={{ onCheckIn: handleCheckIn, onCheckOut: handleCheckOut }}
    />
  );
}
