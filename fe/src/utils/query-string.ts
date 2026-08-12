/**
 * Utility untuk membangun query string dari objek parameter.
 *
 * Nilai `undefined`, `null`, dan string kosong diabaikan.
 * Semua nilai di-encode dengan `encodeURIComponent`.
 *
 * @example
 * buildQueryString({ page: 1, limit: 10, keyword: 'test' })
 * // => '?page=1&limit=10&keyword=test'
 *
 * buildQueryString({})
 * // => ''
 */
export function buildQueryString(
  params?: Record<string, string | number | boolean | null | undefined>,
): string {
  if (!params) return '';

  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  );

  if (entries.length === 0) return '';

  const qs = entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');

  return `?${qs}`;
}
