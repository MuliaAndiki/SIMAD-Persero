/**
 * Utilitas pembuatan PDF tanpa dependency eksternal.
 * Menghasilkan dokumen PDF valid satu halaman (A4 portrait) menggunakan
 * font standar PDF (Helvetica / Helvetica-Bold — tidak perlu embed font).
 *
 * Dipakai untuk modul Certificate (BR-CERT-006: sertifikat dalam format PDF).
 * Sumber aturan: docs/07-api-specification.md §17, docs/04-business-rules.md §23.
 */

const PAGE_WIDTH = 595.28; // A4 width in pt
const PAGE_HEIGHT = 841.89; // A4 height in pt

interface PdfTextLine {
  text: string;
  size: number;
  bold?: boolean;
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

/** Bangun stream konten halaman dari daftar baris teks (semua rata tengah). */
function buildContentStream(lines: PdfTextLine[]): string {
  let y = 730;
  const commands: string[] = [];

  for (const line of lines) {
    const text = escapePdfText(line.text);
    if (text.length > 0) {
      const font = line.bold ? 'F2' : 'F1';
      const x = centerX(line.text, line.size);
      commands.push(
        `BT /${font} ${line.size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${text}) Tj ET`,
      );
    }
    y -= line.size * 1.75;
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
  departmentName: string;
  startDate: string;
  endDate: string;
  verificationToken: string;
}

/**
 * Generate sertifikat magang dalam bentuk PDF.
 * Konten sederhana namun valid — cukup untuk memenuhi BR-CERT-006/007.
 */
export function generateCertificatePdf(data: CertificatePdfData): Buffer {
  const lines: PdfTextLine[] = [
    { text: 'SERTIFIKAT MAGANG', size: 28, bold: true },
    { text: 'PT PLN (Persero)', size: 16, bold: true },
    { text: '', size: 20 },
    { text: 'Diberikan kepada:', size: 12 },
    { text: data.internName, size: 24, bold: true },
    { text: data.departmentName, size: 14 },
    { text: '', size: 14 },
    {
      text: `Telah menyelesaikan program magang dari ${data.startDate} sampai dengan ${data.endDate}`,
      size: 12,
    },
    { text: '', size: 16 },
    { text: `Nomor Sertifikat: ${data.certificateNumber}`, size: 11 },
    { text: `Kode Verifikasi: ${data.verificationToken}`, size: 11 },
  ];

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
