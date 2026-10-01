import { Resend } from 'resend';
import { env } from '@/config/env.config';
import { generateEmailHtml } from '@/utils/email-template.util';
import { getLogger } from '../telemetry/otel.config';

interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const resendApiKey = env.RESEND_API_KEY ?? process.env.RESEND_API_KEY ?? '';
const isConfigured = resendApiKey !== '' && !resendApiKey.startsWith('xxxx');

const resend = isConfigured ? new Resend(resendApiKey) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export async function sendEmail(options: MailOptions): Promise<void> {
  if (!isConfigured || !resend) {
    getLogger().info(
      {
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      },
      '[EMAIL][DEV MODE - RESEND NOT CONFIGURED]',
    );
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text || '<p></p>',
    });

    if (error) {
      throw new Error(`[EMAIL][RESEND] Gagal mengirim email: ${error.message}`);
    }

    getLogger().info({ id: data?.id, to: options.to }, '[EMAIL][RESEND] Email sent successfully');
  } catch (error) {
    console.error('Failed to send email via Resend:', error);
    throw error;
  }
}

/** Membangun URL frontend (default http://localhost:3000). */
export function buildFrontendUrl(path: string): string {
  const base = (env.FRONTEND_URL ?? process.env.FRONTEND_URL ?? 'http://localhost:3000').replace(
    /\/$/,
    '',
  );
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Format tanggal ke bahasa Indonesia (ASCII-safe) untuk email. */
function formatDateId(date: Date | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '-';
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function toDateKey(date: Date | null | undefined): string | null {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export interface StartDateMailInput {
  to: string;
  fullName: string;
  applicationNumber?: string | null;
  oldStartDate?: Date | null;
  newStartDate: Date;
  /** Kalimat pembuka, mis. persetujuan atau pemberitahuan perubahan. */
  headline: string;
}

/**
 * Email tanggal masuk yang ditentukan/diubah admin.
 * Menyebutkan perubahan tanggal bila berbeda, plus pengingat memeriksa
 * folder SPAM agar informasi tidak kelewat.
 */
export async function sendStartDateEmail(input: StartDateMailInput): Promise<void> {
  const startFmt = formatDateId(input.newStartDate);
  const changed =
    toDateKey(input.oldStartDate) !== null &&
    toDateKey(input.oldStartDate) !== toDateKey(input.newStartDate);
  const changePart = changed
    ? ` Tanggal masuk diubah dari ${formatDateId(input.oldStartDate)} menjadi ${startFmt} karena keterbatasan slot kuota.`
    : '';
  const appNo = input.applicationNumber ?? '-';

  const text = `Halo ${input.fullName},

${input.headline} (No. Pengajuan: ${appNo}).

Tanggal masuk yang ditentukan admin: ${startFmt}.${changePart}

PENTING: Jika email ini tidak muncul di kotak masuk, periksa folder SPAM/promosi agar informasi tanggal masuk ini tidak kelewat.

Pantau pengajuan Anda di: ${buildFrontendUrl('/intern/application')}`;

  await sendEmail({
    to: input.to,
    subject: `Tanggal Masuk Magang: ${startFmt}`,
    text,
    html: generateEmailHtml({
      recipientName: input.fullName,
      title: 'Tanggal Masuk Magang',
      bodyText: `${input.headline} (No. Pengajuan: ${appNo}). Tanggal masuk yang ditentukan admin adalah ${startFmt}.${changePart} Mohon periksa folder SPAM atau promosi apabila email ini tidak ada di kotak masuk, agar informasi tanggal masuk tidak kelewat.`,
      buttonText: 'Lihat Pengajuan Saya',
      buttonUrl: buildFrontendUrl('/intern/application'),
      expiryText: 'Simpan email ini sebagai pengingat jadwal mulai magang Anda.',
    }),
  });
}
