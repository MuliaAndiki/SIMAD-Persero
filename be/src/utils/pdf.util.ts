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
  color?: string; // RGB color string in PDF format: "r g b", e.g. "0.043 0.631 0.725"
  y?: number; // Custom Y position
  x?: number; // Custom X position (if undefined, centers horizontally)
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
      const colorCmd = line.color ? `${line.color} rg` : '0 0 0 rg';
      const y = line.y ?? 400;

      // Determine X position based on whether custom x is provided
      let x: number;
      if (line.x !== undefined) {
        x = line.x;
      } else {
        // Center-aligned (default)
        x = centerX(line.text, line.size);
      }

      commands.push(
        `q ${colorCmd} BT /${font} ${line.size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${text}) Tj ET Q`,
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
 * Generate sertifikat magang dalam bentuk PDF dengan layout dan posisi
 * yang presisi mengikuti referensi resmi Contoh.jpg.
 */
export function generateCertificatePdf(data: CertificatePdfData): Buffer {
  const config = CERTIFICATE_CONFIG;
  const lines: PdfTextLine[] = [];

  // --- 1. TITLE: "SERTIFIKAT" (PLN Cyan #0ba1b9) ---
  lines.push({
    text: config.text.title,
    size: config.title.fontSize,
    bold: true,
    color: config.colors.cyan,
    y: config.title.y,
  });

  // --- 2. SUBTITLE: "diberikan kepada" ---
  lines.push({
    text: config.text.givenTo,
    size: config.givenTo.fontSize,
    bold: false,
    color: config.colors.slate,
    y: config.givenTo.y,
  });

  // --- 3. RECIPIENT NAME: Large Bold Black (No underline) ---
  const nameSize = getScaledFontSize(
    data.internName,
    config.internName.fontSize,
    config.internName.maxWidth ?? 650,
  );
  lines.push({
    text: data.internName.toUpperCase(),
    size: nameSize,
    bold: true,
    color: config.colors.black,
    y: config.internName.y,
  });

  // --- 4. NIM ---
  lines.push({
    text: `${config.text.studentNumberPrefix} ${data.studentNumber}`,
    size: config.studentNumber.fontSize,
    bold: true,
    color: config.colors.black,
    y: config.studentNumber.y,
  });

  // --- 5. DESCRIPTION PARAGRAPH ---
  const cityName = data.cityName ?? config.official.city;
  const unitText = data.cityName ? `Unit Induk Distribusi ${data.cityName}` : config.official.unit;
  
  lines.push({
    text: `Telah menyelesaikan program magang di PT PLN (Persero) ${unitText} pada bidang`,
    size: config.completion.fontSize,
    bold: false,
    color: config.colors.black,
    y: config.completion.line1Y,
  });

  lines.push({
    text: `${data.departmentName} dari tanggal ${data.startDate} hingga ${data.endDate} dengan hasil :`,
    size: config.completion.fontSize,
    bold: false,
    color: config.colors.black,
    y: config.completion.line2Y,
  });

  // --- 6. GRADE / RESULT: "SANGAT KOMPETEN" (PLN Cyan #0ba1b9) ---
  lines.push({
    text: config.text.grade,
    size: config.grade.fontSize,
    bold: true,
    color: config.colors.cyan,
    y: config.grade.y,
  });

  // --- 7. CENTERED SIGNATURE BLOCK ---
  const issueDate = data.issueDate ?? (data.endDate || '31 Agustus 2026');
  
  // City and Date (Centered)
  lines.push({
    text: `${cityName}, ${issueDate}`,
    size: config.signature.fontSize,
    bold: false,
    color: config.colors.black,
    y: config.signature.cityDateY,
  });

  // Signer Name (Centered, Bold Uppercase)
  lines.push({
    text: config.official.name.toUpperCase(),
    size: config.signature.fontSizeName,
    bold: true,
    color: config.colors.black,
    y: config.signature.nameY,
  });

  // Signer Position (Centered)
  lines.push({
    text: config.official.position,
    size: config.signature.fontSizePosition,
    bold: false,
    color: config.colors.black,
    y: config.signature.positionY,
  });

  // Unit (Centered)
  lines.push({
    text: config.official.unit,
    size: config.signature.fontSizePosition,
    bold: false,
    color: config.colors.black,
    y: config.signature.unitY,
  });

  // --- 8. FOOTER: VERIFICATION TOKEN ---
  lines.push({
    text: `${config.text.verificationPrefix} ${data.verificationToken}`,
    size: config.verification.fontSize,
    bold: false,
    color: config.colors.slate,
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
