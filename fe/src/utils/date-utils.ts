/** Estimasi tanggal selesai = tanggal mulai + N bulan (format YYYY-MM-DD). */
export function calculateEndDate(startIsoDate: string, monthsStr: string): string {
  if (!startIsoDate) return '';
  const d = new Date(startIsoDate);
  if (Number.isNaN(d.getTime())) return '';
  const months = Number.parseInt(monthsStr, 10) || 2;
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0] ?? '';
}

/** Normalisasi tanggal (ISO / Date) menjadi kunci YYYY-MM-DD. */
export function dateKey(value: string | Date): string {
  if (typeof value === 'string') {
    return value.slice(0, 10);
  }
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Apakah hari Senin–Jumat (hari kerja magang). */
export function isWorkday(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

export interface Workday {
  date: Date;
  key: string;
  dayNumber: number;
}

/** Daftar hari kerja (Senin–Jumat) pada bulan yang ditampilkan. */
export function buildWorkdays(
  month: number,
  year: number,
  start?: string | null,
  end?: string | null,
): Workday[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const startKey = start ? dateKey(start) : null;
  const endKey = end ? dateKey(end) : null;

  const days: Workday[] = [];
  for (let d = 1; d <= daysInMonth; d += 1) {
    const date = new Date(year, month - 1, d);
    if (!isWorkday(date)) continue;
    const key = dateKey(date);
    if (startKey && key < startKey) continue;
    if (endKey && key > endKey) continue;
    days.push({ date, key, dayNumber: d });
  }
  return days;
}

/** Jarak dalam meter, mis. "120 m". */
export function formatDistanceMeter(value: number | null | undefined): string {
  if (value == null) return '-';
  return `${value.toFixed(0)} m`;
}
