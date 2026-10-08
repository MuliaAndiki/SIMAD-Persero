export const GUIDE_CATEGORY_LABELS: Record<string, string> = {
  REGISTRATION: 'Pendaftaran',
  ONBOARDING: 'Orientasi',
  ATTENDANCE: 'Presensi',
  LOGBOOK: 'Jurnal',
  FINAL_REPORT: 'Laporan Akhir',
  CERTIFICATE: 'Sertifikat',
  GENERAL: 'Umum',
};

export function getGuideCategoryLabel(category: string): string {
  return GUIDE_CATEGORY_LABELS[category] ?? category;
}
