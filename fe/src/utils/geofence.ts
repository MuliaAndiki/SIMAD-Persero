/**
 * Geofence & Attendance Time Window Utility
 * Haversine formula calculation & WIB (UTC+7) time validation for Check-In and Check-Out.
 */

const EARTH_RADIUS_METERS = 6_371_000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Menghitung jarak garis lurus (lingkaran besar) dalam satuan meter
 * antara dua koordinat GPS menggunakan formula Haversine.
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Memvalidasi apakah posisi pengguna berada di dalam radius kantor.
 */
export function checkInsideGeofence(
  userLat: number,
  userLon: number,
  centerLat: number,
  centerLon: number,
  radiusMeter: number,
): { distance: number; inside: boolean } {
  const distance = haversineDistance(userLat, userLon, centerLat, centerLon);
  return {
    distance: Math.round(distance * 10) / 10,
    inside: distance <= radiusMeter,
  };
}

/**
 * Mendapatkan waktu sekarang dalam zona WIB (UTC+7).
 */
export function getWibTime(date: Date = new Date()): {
  hours: number;
  minutes: number;
  totalMinutes: number;
  timeStr: string;
} {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const wibDate = new Date(utc + 7 * 3600000);
  const hours = wibDate.getHours();
  const minutes = wibDate.getMinutes();

  return {
    hours,
    minutes,
    totalMinutes: hours * 60 + minutes,
    timeStr: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} WIB`,
  };
}

function parseTimeMinutes(
  timeStr?: string | null,
  fallbackHours = 0,
  fallbackMinutes = 0,
): { minutes: number; label: string } {
  if (timeStr) {
    const d = new Date(timeStr);
    if (!Number.isNaN(d.getTime())) {
      const h = d.getUTCHours();
      const m = d.getUTCMinutes();
      return {
        minutes: h * 60 + m,
        label: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} WIB`,
      };
    }
  }
  return {
    minutes: fallbackHours * 60 + fallbackMinutes,
    label: `${String(fallbackHours).padStart(2, '0')}:${String(fallbackMinutes).padStart(2, '0')} WIB`,
  };
}

export interface TimeWindowValidationResult {
  allowed: boolean;
  message: string;
  currentWib: string;
  windowLabel: string;
}

/**
 * Memvalidasi batasan jam absensi:
 * - Check-in: 08:00 s/d 10:00 WIB
 * - Check-out: 17:00 (5 sore) s/d 20:00 (8 malam) WIB
 */
export function validateAttendanceTime(
  type: 'CHECK_IN' | 'CHECK_OUT',
  setting?: {
    checkInStart?: string | null;
    checkInEnd?: string | null;
    checkOutStart?: string | null;
    checkOutEnd?: string | null;
  } | null,
  now: Date = new Date(),
): TimeWindowValidationResult {
  const current = getWibTime(now);

  if (type === 'CHECK_IN') {
    const start = parseTimeMinutes(setting?.checkInStart, 8, 0);
    const end = parseTimeMinutes(setting?.checkInEnd, 10, 0);
    const windowLabel = `${start.label.replace(' WIB', '')} - ${end.label}`;

    if (current.totalMinutes < start.minutes) {
      return {
        allowed: false,
        message: `Waktu Check-in belum dimulai. Jadwal Check-in adalah pukul ${windowLabel}.`,
        currentWib: current.timeStr,
        windowLabel,
      };
    }

    if (current.totalMinutes > end.minutes) {
      return {
        allowed: false,
        message: `Batas waktu Check-in telah berakhir. Jadwal Check-in adalah pukul ${windowLabel}.`,
        currentWib: current.timeStr,
        windowLabel,
      };
    }

    return {
      allowed: true,
      message: `Waktu Check-in aktif (${windowLabel}).`,
      currentWib: current.timeStr,
      windowLabel,
    };
  }

  // CHECK_OUT: 17:00 - 20:00 WIB
  const start = parseTimeMinutes(setting?.checkOutStart, 17, 0);
  const end = parseTimeMinutes(setting?.checkOutEnd, 20, 0);
  const windowLabel = `${start.label.replace(' WIB', '')} - ${end.label}`;

  if (current.totalMinutes < start.minutes) {
    return {
      allowed: false,
      message: `Waktu Check-out belum dimulai. Jadwal Check-out adalah pukul ${windowLabel}.`,
      currentWib: current.timeStr,
      windowLabel,
    };
  }

  if (current.totalMinutes > end.minutes) {
    return {
      allowed: false,
      message: `Batas waktu Check-out telah berakhir. Jadwal Check-out adalah pukul ${windowLabel}.`,
      currentWib: current.timeStr,
      windowLabel,
    };
  }

  return {
    allowed: true,
    message: `Waktu Check-out aktif (${windowLabel}).`,
    currentWib: current.timeStr,
    windowLabel,
  };
}
