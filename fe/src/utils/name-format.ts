/** Inisial nama untuk fallback avatar. */
export function getInitials(fullName?: string | null): string {
  if (!fullName) return '';
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
