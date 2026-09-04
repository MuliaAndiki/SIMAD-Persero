/**
 * Utilitas pembuatan PDF tanpa dependency eksternal.
 * Menghasilkan dokumen PDF valid satu halaman menggunakan
 * font standar PDF (Helvetica / Helvetica-Bold — tidak perlu embed font).
 *
 * Dipakai untuk modul Certificate (BR-CERT-006: sertifikat dalam format PDF).
 * Sumber aturan: docs/07-api-specification.md §17, docs/04-business-rules.md §23.
 * 
 * Updated: Enhanced template system with configurable layout (A4 landscape).
 */

import { CERTIFICATE_CONFIG, getScaledFontSize, wrapText } from '@/config/certificate.template.config';

const PAGE_WIDTH = CERTIFICATE_CONFIG.page.width;
const PAGE_HEIGHT = CERTIFICATE_CONFIG.page.height;

interface PdfTextLine {
  text: string;
  size: number;
  bold?: boolean;
  y?: number; // Custom Y position (if specified)
  x?: number; // Custom X position (if specified, for right-aligned text)
}

/**
 * Escape string PDF agar aman di dalam operator `Tj (...)`:
 * - backslash & kurung di-escape
 * - karakter non-Latin1 diganti '?' (font standar Helvetica hanya Latin1)
 */
function escapePdfText(text: string): string {
  let out = '';
  for (const ch of text) {
    if (ch.charCodeAt(0) > 255) {
      out += '?';
      continue;
    }
    if (ch === '\\') out += '\\\\';
    else if (ch === '(') out += '\\(';
    else if (ch === ')') out += '\\)';
    else out += ch;
  }
  return out;
}

/** Perkiraan lebar teks Helvetica: ±0.5 * fontSize per karakter. */
function approximateTextWidth(text: string, fontSize: number): number {
  return text.length * fontSize * 0.5;
}

/** Koordinat X agar teks berada di tengah halaman. */
function centerX(text: string, fontSize: number): number {
  return (PAGE_WIDTH - approximateTextWidth(text, fontSize)) / 2;
}

/** Bangun stream konten halaman dari daftar baris teks. */
function buildContentStream(lines: PdfTextLine[]): string {
  const commands: string[] = [];

  for (const line of lines) {
    const text = escapePdfText(line.text);
    if (text.length > 0) {
      const font = line.bold ? 'F2' : 'F1';
      
      // Use custom Y if provided, otherwise text will be positioned manually
      const y = line.y ?? 400;
      
      // Determine X position based on whether custom x is provided
      let x: number;
      if (line.x !== undefined) {
        // Custom X (for right-aligned signature section)
        x = line.x;
      } else {
        // Center-aligned (default)
        x = centerX(line.text, line.size);
      }
      
      commands.push(
        `BT /${font} ${line.size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${text}) Tj ET`,
      );
    }
  }

  return commands.join('\n');
}

/**
 * Rakit dokumen PDF satu halaman.
 * Referensi: PDF 1.4 spec — objek, xref table, trailer.
 */
function buildPdf(objects: string[]): Buffer {
  const header = '%PDF-1.4\n';
  let body = '';
  const offsets: number[] = [];

  for (const obj of objects) {
    offsets.push(Buffer.byteLength(header + body, 'latin1'));
    body += `${obj}\n`;
  }

  const xrefStart = Buffer.byteLength(header + body, 'latin1');
  let xref = `xref\n0 ${objects.length + 1}\n`;
  xref += '0000000000 65535 f \n';
  for (const offset of offsets) {
    xref += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(header + body + xref + trailer, 'latin1');
}

export interface CertificatePdfData {
  certificateNumber: string;
  internName: string;
  studentNumber: string;
  institutionName: string;
  departmentName: string;
  startDate: string;
  endDate: string;
  verificationToken: string;
  cityName?: string;
  issueDate?: string;
}

/**
 * Generate sertifikat magang dalam bentuk PDF dengan template enhanced.
 * Layout landscape A4 mengikuti referensi sertifikat PLN.
 * Mendukung auto-scaling untuk nama panjang dan wrapping text.
 */
export function generateCertificatePdf(data: CertificatePdfData): Buffer {
  const config = CERTIFICATE_CONFIG;
  const lines: PdfTextLine[] = [];

  // --- HEADER SECTION ---
  
  // Title: "SERTIFIKAT"
  lines.push({
    text: config.text.title,
    size: config.title.fontSize,
    bold: true,
    y: config.title.y,
  });

  // Company name: "PT PLN (Persero)"
  lines.push({
    text: config.text.company,
    size: config.companyName.fontSize,
    bold: true,
    y: config.companyName.y,
  });

  // --- BODY SECTION ---

  // "Diberikan kepada"
  lines.push({
    text: config.text.givenTo,
    size: config.givenTo.fontSize,
    bold: false,
    y: config.givenTo.y,
  });

  // Intern name (with auto-scaling if too long)
  const nameSize = getScaledFontSize(
    data.internName,
    config.internName.fontSize,
    config.internName.maxWidth ?? 600,
  );
  lines.push({
    text: data.internName,
    size: nameSize,
    bold: true,
    y: config.internName.y,
  });

  // Student number (NIM/NPM)
  lines.push({
    text: `${config.text.studentNumberPrefix} ${data.studentNumber}`,
    size: config.studentNumber.fontSize,
    bold: false,
    y: config.studentNumber.y,
  });

  // Institution name (with auto-scaling if too long)
  const institutionSize = getScaledFontSize(
    data.institutionName,
    config.institution.fontSize,
    config.institution.maxWidth ?? 600,
  );
  lines.push({
    text: data.institutionName,
    size: institutionSize,
    bold: false,
    y: config.institution.y,
  });

  // "Telah menyelesaikan program magang di"
  lines.push({
    text: config.text.completionText,
    size: config.completionText.fontSize,
    bold: false,
    y: config.completionText.y,
  });

  // Company unit
  lines.push({
    text: config.text.company,
    size: config.companyUnit.fontSize,
    bold: true,
    y: config.companyUnit.y,
  });

  // "pada bidang"
  lines.push({
    text: config.text.departmentLabel,
    size: config.departmentLabel.fontSize,
    bold: false,
    y: config.departmentLabel.y,
  });

  // Department name (with auto-scaling if too long)
  const deptSize = getScaledFontSize(
    data.departmentName,
    config.department.fontSize,
    config.department.maxWidth ?? 500,
  );
  lines.push({
    text: data.departmentName,
    size: deptSize,
    bold: true,
    y: config.department.y,
  });

  // Date range
  const dateRangeText = `${config.text.dateRangePrefix} ${data.startDate} ${config.text.dateRangeMid} ${data.endDate}`;
  lines.push({
    text: dateRangeText,
    size: config.dateRange.fontSize,
    bold: false,
    y: config.dateRange.y,
  });

  // Certificate number
  lines.push({
    text: `${config.text.certificateNumberPrefix} ${data.certificateNumber}`,
    size: config.certificateNumber.fontSize,
    bold: false,
    y: config.certificateNumber.y,
  });

  // --- SIGNATURE SECTION ---

  // City and date (right aligned)
  const cityName = data.cityName ?? config.official.city;
  const issueDate = data.issueDate ?? new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  lines.push({
    text: `${cityName}, ${issueDate}`,
    size: config.signature.fontSize,
    bold: false,
    y: config.signature.cityDateY,
    x: config.signature.x,
  });

  // Official name
  lines.push({
    text: config.official.name,
    size: config.signature.fontSizeName,
    bold: true,
    y: config.signature.nameY,
    x: config.signature.x,
  });

  // Official position
  lines.push({
    text: config.official.position,
    size: config.signature.fontSizePosition,
    bold: false,
    y: config.signature.positionY,
    x: config.signature.x,
  });

  // --- FOOTER SECTION ---

  // Verification code
  lines.push({
    text: `${config.text.verificationPrefix} ${data.verificationToken}`,
    size: config.verification.fontSize,
    bold: false,
    y: config.verification.y,
  });

  const content = buildContentStream(lines);
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj',
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>\nendobj`,
    `4 0 obj\n<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream\nendobj`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj',
    '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj',
  ];

  return buildPdf(objects);
}
