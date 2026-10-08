export interface GeoError {
  message: string;
}

/** Promise wrapper geolokasi browser dengan pesan error Bahasa Indonesia. */
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      reject(new Error('Perangkat atau browser tidak mendukung fitur geolokasi.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (err) => {
        const messages: Record<number, string> = {
          1: 'Izin akses lokasi (GPS) ditolak. Harap izinkan akses lokasi pada browser/perangkat.',
          2: 'Posisi GPS tidak tersedia. Pastikan sinyal GPS aktif.',
          3: 'Waktu permintaan lokasi habis (timeout). Silakan klik tombol perbarui lokasi.',
        };
        reject(new Error(messages[err.code] ?? err.message));
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      },
    );
  });
}
