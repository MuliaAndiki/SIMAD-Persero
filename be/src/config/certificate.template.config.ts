/**
 * Konfigurasi template sertifikat magang.
 * 
 * Layout mengikuti referensi sertifikat PLN dengan struktur:
 * - Header: Logo & Kop Surat
 * - Body: Informasi peserta & magang
 * - Footer: Tanda tangan & stempel
 * 
 * Koordinat dalam points (1 pt = 1/72 inch).
 * A4 Landscape: 841.89 x 595.28 pt
 */

export const CERTIFICATE_CONFIG = {
  // Page settings
  page: {
    width: 841.89, // A4 landscape width
    height: 595.28, // A4 landscape height
    orientation: 'landscape' as const,
  },

  // Margins
  margin: {
    top: 40,
    bottom: 40,
    left: 60,
    right: 60,
  },

  // Logo position (top center)
  logo: {
    x: 370, // centered approximately
    y: 520,
    width: 100,
    height: 50,
  },

  // Title "SERTIFIKAT"
  title: {
    y: 450,
    fontSize: 32,
    fontWeight: 'bold' as const,
    align: 'center' as const,
  },

  // Company name "PT PLN (Persero)"
  companyName: {
    y: 425,
    fontSize: 18,
    fontWeight: 'bold' as const,
    align: 'center' as const,
  },

  // "Diberikan kepada" text
  givenTo: {
    y: 390,
    fontSize: 12,
    fontWeight: 'normal' as const,
    align: 'center' as const,
  },

  // Intern name (main focus)
  internName: {
    y: 360,
    fontSize: 26,
    fontWeight: 'bold' as const,
    align: 'center' as const,
    maxWidth: 600,
  },

  // Student number (NIM/NPM)
  studentNumber: {
    y: 335,
    fontSize: 12,
    fontWeight: 'normal' as const,
    align: 'center' as const,
  },

  // Institution name
  institution: {
    y: 315,
    fontSize: 13,
    fontWeight: 'normal' as const,
    align: 'center' as const,
    maxWidth: 600,
  },

  // "Telah menyelesaikan program magang di" text
  completionText: {
    y: 285,
    fontSize: 11,
    fontWeight: 'normal' as const,
    align: 'center' as const,
  },

  // Company unit text
  companyUnit: {
    y: 270,
    fontSize: 13,
    fontWeight: 'bold' as const,
    align: 'center' as const,
  },

  // "pada bidang" text
  departmentLabel: {
    y: 250,
    fontSize: 11,
    fontWeight: 'normal' as const,
    align: 'center' as const,
  },

  // Department name
  department: {
    y: 230,
    fontSize: 16,
    fontWeight: 'bold' as const,
    align: 'center' as const,
    maxWidth: 500,
  },

  // Date range text
  dateRange: {
    y: 200,
    fontSize: 11,
    fontWeight: 'normal' as const,
    align: 'center' as const,
  },

  // Certificate number
  certificateNumber: {
    y: 170,
    fontSize: 10,
    fontWeight: 'normal' as const,
    align: 'center' as const,
  },

  // Signature section
  signature: {
    x: 600,
    y: 130,
    cityDateY: 130,
    nameY: 80,
    positionY: 65,
    fontSize: 11,
    fontSizeName: 12,
    fontSizePosition: 10,
    align: 'center' as const,
  },

  // Verification code (bottom center)
  verification: {
    y: 30,
    fontSize: 9,
    fontWeight: 'normal' as const,
    align: 'center' as const,
  },

  // Official data (can be configured)
  official: {
    name: 'Direktur Sumber Daya Manusia',
    position: 'PT PLN (Persero)',
    city: 'Jakarta',
  },

  // Text constants
  text: {
    title: 'SERTIFIKAT',
    company: 'PT PLN (Persero)',
    givenTo: 'Diberikan kepada',
    studentNumberPrefix: 'NIM/NPM:',
    completionText: 'Telah menyelesaikan program magang di',
    departmentLabel: 'pada bidang',
    dateRangePrefix: 'dari tanggal',
    dateRangeMid: 'sampai dengan',
    certificateNumberPrefix: 'Nomor Sertifikat:',
    verificationPrefix: 'Kode Verifikasi:',
  },
} as const;

/**
 * Utility untuk menghitung posisi X centered.
 */
export function getCenteredX(textWidth: number): number {
  return (CERTIFICATE_CONFIG.page.width - textWidth) / 2;
}

/**
 * Utility untuk wrapping text panjang.
 * Memecah text jika melebihi maxWidth.
 */
export function wrapText(text: string, maxWidth: number, charWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = testLine.length * charWidth;

    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Utility untuk auto-scale text jika terlalu panjang.
 * Returns adjusted fontSize.
 */
export function getScaledFontSize(
  text: string,
  defaultSize: number,
  maxWidth: number,
  charWidthRatio = 0.5,
): number {
  const estimatedWidth = text.length * defaultSize * charWidthRatio;
  if (estimatedWidth <= maxWidth) {
    return defaultSize;
  }
  return Math.floor((maxWidth / (text.length * charWidthRatio)) * 0.95);
}
