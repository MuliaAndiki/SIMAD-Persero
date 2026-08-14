export function camelCaseToWords(str: string) {
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
}

export function kebabCaseToWords(str: string) {
  return str.replace(/[-/]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatDate(value: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
