import { EmailParams, MailerSend, Recipient, Sender } from 'mailersend';

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const MAILERSEND_API_KEY = process.env.MAILERSEND_API_KEY ?? '';
const mailersendConfigured = MAILERSEND_API_KEY !== '' && MAILERSEND_API_KEY !== 'xxxx';

const mailerSend = mailersendConfigured ? new MailerSend({ apiKey: MAILERSEND_API_KEY }) : null;

/** Sender dari email/domain yang sudah diverifikasi di akun MailerSend. */
function getSender(): Sender {
  return new Sender(
    process.env.MAILERSEND_FROM_EMAIL ?? 'no-reply@simad.app',
    process.env.MAILERSEND_FROM_NAME ?? 'SIMAD',
  );
}

export async function sendEmail(options: MailOptions): Promise<void> {
  if (!mailersendConfigured || !mailerSend) {
    console.log('[EMAIL][DEV MODE] To:', options.to);
    console.log('[EMAIL][DEV MODE] Subject:', options.subject);
    console.log('[EMAIL][DEV MODE] Body:', options.text);
    if (options.html) console.log('[EMAIL][DEV MODE] HTML:', options.html);
    return;
  }

  const sentFrom = getSender();
  const recipients = [new Recipient(options.to)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject(options.subject)
    .setText(options.text);

  if (options.html) {
    emailParams.setHtml(options.html);
  }

  try {
    const response = await mailerSend.email.send(emailParams);
    if (response.statusCode >= 400) {
      throw new Error(
        `[EMAIL][MAILERSEND] Gagal mengirim email (${response.statusCode}): ${JSON.stringify(response.body)}`,
      );
    }
  } catch (error: unknown) {
    // SDK melempar objek { headers, body, statusCode } saat respons bukan 2xx.
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const apiError = error as { statusCode: number; body: unknown };
      throw new Error(
        `[EMAIL][MAILERSEND] Gagal mengirim email (${apiError.statusCode}): ${JSON.stringify(apiError.body)}`,
      );
    }
    throw error;
  }
}

/** Membangun URL frontend (default http://localhost:3000). */
export function buildFrontendUrl(path: string): string {
  const base = (process.env.FRONTEND_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
