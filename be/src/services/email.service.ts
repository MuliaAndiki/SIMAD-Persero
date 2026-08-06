import nodemailer from 'nodemailer';

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * SMTP di .env masih placeholder ("xxxx"), sehingga transporter hanya dibuat
 * apabila konfigurasi SMTP sudah terisi. Jika tidak, email dicetak ke console
 * (dev mode) agar alur verifikasi tetap bisa diuji.
 */
const smtpConfigured =
  process.env.SMTP_HOST !== undefined &&
  process.env.SMTP_HOST !== '' &&
  process.env.SMTP_HOST !== 'xxxx' &&
  process.env.SMTP_USER !== undefined &&
  process.env.SMTP_USER !== '' &&
  process.env.SMTP_USER !== 'xxxx';

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER ?? '',
        pass: process.env.SMTP_PASS ?? '',
      },
    })
  : null;

export async function sendEmail(options: MailOptions): Promise<void> {
  if (!transporter) {
    console.log('[EMAIL][DEV MODE] To:', options.to);
    console.log('[EMAIL][DEV MODE] Subject:', options.subject);
    console.log('[EMAIL][DEV MODE] Body:', options.text);
    if (options.html) console.log('[EMAIL][DEV MODE] HTML:', options.html);
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? `SIMAD <${process.env.SMTP_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}

/** Membangun URL frontend (default http://localhost:3000). */
export function buildFrontendUrl(path: string): string {
  const base = (process.env.FRONTEND_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
