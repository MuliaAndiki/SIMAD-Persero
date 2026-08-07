interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const MAILERSEND_API_URL = 'https://api.mailersend.com/v1/email';
const mailersendConfigured =
  process.env.MAILERSEND_API_KEY !== undefined &&
  process.env.MAILERSEND_API_KEY !== '' &&
  process.env.MAILERSEND_API_KEY !== 'xxxx';

export async function sendEmail(options: MailOptions): Promise<void> {
  if (!mailersendConfigured) {
    console.log('[EMAIL][DEV MODE] To:', options.to);
    console.log('[EMAIL][DEV MODE] Subject:', options.subject);
    console.log('[EMAIL][DEV MODE] Body:', options.text);
    if (options.html) console.log('[EMAIL][DEV MODE] HTML:', options.html);
    return;
  }

  const response = await fetch(MAILERSEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.MAILERSEND_API_KEY}`,
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify({
      from: {
        email: process.env.MAILERSEND_FROM_EMAIL ?? 'no-reply@simad.app',
      },
      to: [{ email: options.to }],
      subject: options.subject,
      text: options.text,
      ...(options.html ? { html: options.html } : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`[EMAIL][MAILERSEND] Gagal mengirim email (${response.status}): ${errorText}`);
  }
}

/** Membangun URL frontend (default http://localhost:3000). */
export function buildFrontendUrl(path: string): string {
  const base = (process.env.FRONTEND_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
