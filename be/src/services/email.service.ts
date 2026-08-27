import { Resend } from 'resend';
import { env } from '@/config/env.config';
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
