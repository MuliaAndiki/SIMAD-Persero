export function getCorrectionStatusLabel(status: string | null | undefined): string {
  switch (status) {
    case 'APPROVED':
      return 'Disetujui';
    case 'REJECTED':
      return 'Ditolak';
    case 'CANCELLED':
      return 'Dibatalkan';
    case 'PENDING':
      return 'Menunggu Review';
    default:
      return status ?? '-';
  }
}

export function getCorrectionTypeLabel(type: string | null | undefined): string {
  switch (type) {
    case 'CHECK_IN':
      return 'Koreksi Masuk';
    case 'CHECK_OUT':
      return 'Koreksi Pulang';
    case 'BOTH':
      return 'Koreksi Masuk & Pulang';
    case 'INVALID_OVERRIDE':
      return 'Koreksi Presensi Alpa / Invalid';
    default:
      return type ?? '-';
  }
}
