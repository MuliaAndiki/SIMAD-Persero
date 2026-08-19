import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.string(),
  PORT: z.string(),
  JWT_SECRET: z.string(),
  FRONTEND_URL: z.string().url(),
  CORS_ORIGINS: z.string().optional(),
  INTERNAL_API_SECRET: z.string(),
  VAPID_PUBLIC_KEY: z.string(),
  VAPID_PRIVATE_KEY: z.string(),
  VAPID_SUBJECT: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  MAILERSEND_API_KEY: z.string(),
  MAILERSEND_FROM_EMAIL: z.string().email().optional(),
  MAILERSEND_FROM_NAME: z.string().optional(),
  // Observability (OpenTelemetry / logging)
  OTEL_ENDPOINT: z.string().url().optional(),
  OTEL_ENABLED: z.string().optional(),
  LOG_LEVEL: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error(' Invalid Env Variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
