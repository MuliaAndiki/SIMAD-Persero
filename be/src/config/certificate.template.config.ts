/**
 * Konfigurasi template sertifikat magang.
 * 
 * Layout mengikuti referensi sertifikat PLN dengan struktur:
 * - Header: Logo & Kop Surat
 * - Body: Informasi peserta & magang
 * - Footer: Tanda tangan & stempel
 * 
 * Koordinat dalam points (1 pt = 1/72 inch).
 * A4 Landscape: 29.7 cm × 21.0 cm (841.89 pt × 595.28 pt)
 */

export const CERTIFICATE_CONFIG = {
  // Page settings (A4 Landscape: 29.7 cm x 21.0 cm)
  page: {
    width: 841.89, // A4 landscape width (29.7 cm / 11.693 in * 72 pt)
    height: 595.28, // A4 landscape height (21.0 cm / 8.268 in * 72 pt)
    orientation: 'landscape' as const,
  },

  // Margins
  margin: {
    top: 40,
    bottom: 40,
    left: 60,
    right: 60,
  },

  // Colors (RGB fractions 0-1 for PDF operator 'rg')
  colors: {
    cyan: '0.043 0.631 0.725', // #0ba1b9 Official PLN Cyan
    black: '0 0 0',
    slate: '0.12 0.16 0.22',
  },

  // Title "SERTIFIKAT" (PLN Cyan #0ba1b9)
  title: {
    y: 460,
    fontSize: 36,
    fontWeight: 'bold' as const,
    align: 'center' as const,
  },

  // "diberikan kepada" text (lowercase)
  givenTo: {
    y: 425,
    fontSize: 12,
    fontWeight: 'normal' as const,
    align: 'center' as const,
  },

  // Intern name (main focus - bold black, no underline)
  internName: {
    y: 385,
    fontSize: 28,
    fontWeight: 'bold' as const,
    align: 'center' as const,
    maxWidth: 650,
  },

  // Student number (NIM: 230401039)
  studentNumber: {
    y: 355,
    fontSize: 13,
    fontWeight: 'bold' as const,
    align: 'center' as const,
  },

  // Description text lines
  completion: {
    line1Y: 315,
    line2Y: 298,
    fontSize: 11,
    fontWeight: 'normal' as const,
    align: 'center' as const,
  },

  // Grade / Result "SANGAT KOMPETEN" (PLN Cyan #0ba1b9)
  grade: {
    y: 250,
    fontSize: 24,
    fontWeight: 'bold' as const,
    align: 'center' as const,
  },

  // Signature section (Centered horizontally)
  signature: {
    cityDateY: 195,
    nameY: 130,
    positionY: 115,
    unitY: 100,
    fontSize: 11,
    fontSizeName: 13,
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

  // Official data (default based on Contoh.jpg)
  official: {
    name: 'NURLANA',
    position: 'Senior Manager Keuangan, Komunikasi & Umum',
    unit: 'PLN UID Aceh',
    city: 'Banda Aceh',
  },

  // Text constants
  text: {
    title: 'SERTIFIKAT',
    givenTo: 'diberikan kepada',
    studentNumberPrefix: 'NIM:',
    grade: 'SANGAT KOMPETEN',
    company: 'PT PLN (Persero)',
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
