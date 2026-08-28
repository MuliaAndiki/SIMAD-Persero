export interface EmailTemplateOptions {
  recipientName: string;
  title: string;
  bodyText: string;
  buttonText: string;
  buttonUrl: string;
  token?: string;
  expiryText?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Membangun HTML template email responsif dan profesional untuk SIMAD.
 */
export function generateEmailHtml(options: EmailTemplateOptions): string {
  const name = escapeHtml(options.recipientName || 'Pengguna');
  const title = escapeHtml(options.title);
  const bodyText = escapeHtml(options.bodyText);
  const buttonText = escapeHtml(options.buttonText);
  const buttonUrl = options.buttonUrl;
  const token = options.token ? escapeHtml(options.token) : null;
  const expiryText = escapeHtml(options.expiryText || 'Link dan token ini berlaku selama 24 jam.');

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0f172a; padding: 28px 32px; text-align: center;">
              <span style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 1px; display: inline-block;">
                SIMAD<span style="color: #3b82f6;">.</span>
              </span>
              <div style="font-size: 12px; color: #94a3b8; margin-top: 4px; font-weight: 500;">
                Sistem Informasi Manajemen Magang
              </div>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a;">
                Halo, ${name}!
              </h1>
              
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                ${bodyText}
              </p>

              <!-- Action Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${buttonUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.25); text-align: center;">
                  ${buttonText}
                </a>
              </div>

              ${
                token
                  ? `
              <!-- Token Box -->
              <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
                <span style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">
                  Atau Gunakan Token Manual
                </span>
                <code style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 15px; font-weight: 700; color: #1e293b; background-color: #e2e8f0; padding: 6px 12px; border-radius: 4px; display: inline-block; word-break: break-all;">
                  ${token}
                </code>
              </div>
              `
                  : ''
              }

              <!-- Expiry Note -->
              <p style="margin: 20px 0 0 0; font-size: 13px; color: #64748b; text-align: center;">
                <em>${expiryText}</em>
              </p>

              <!-- Divider -->
              <div style="border-top: 1px solid #f1f5f9; margin: 28px 0 20px 0;"></div>

              <!-- Fallback Link -->
              <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5; word-break: break-all;">
                Jika tombol tidak dapat diklik, salin dan tempel link berikut ke browser Anda:<br>
                <a href="${buttonUrl}" style="color: #2563eb; text-decoration: underline;">${buttonUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
              <p style="margin: 0 0 4px 0;">
                <strong>SIMAD</strong> &bull; Perusahaan Perseroan
              </p>
              <p style="margin: 0;">
                Email ini dikirim secara otomatis. Mohon untuk tidak membalas email ini.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
