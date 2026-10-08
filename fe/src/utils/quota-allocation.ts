/** Bagi total kuota merata ke N departemen (sisa ke depan). */
export function distributeEvenly(total: number, count: number): number[] {
  if (count <= 0) return [];
  const safeTotal = Math.max(0, Math.floor(total));
  const base = Math.floor(safeTotal / count);
  let remainder = safeTotal % count;
  return Array.from({ length: count }, () => {
    const extra = remainder > 0 ? 1 : 0;
    if (remainder > 0) remainder -= 1;
    return base + extra;
  });
}

export interface QuotaUsage {
  totalAllocated: number;
  remaining: number;
  isOver: boolean;
}

/** Ringkasan pemakaian kuota terhadap kapasitas kantor. */
export function calcQuotaUsage(allocations: number[], capacity: number): QuotaUsage {
  const totalAllocated = allocations.reduce((sum, a) => sum + (Number(a) || 0), 0);
  const cap = Number(capacity) || 0;
  return {
    totalAllocated,
    remaining: Math.max(0, cap - totalAllocated),
    isOver: totalAllocated > cap,
  };
}
