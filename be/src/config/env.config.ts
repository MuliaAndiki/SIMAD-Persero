import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.string(),
  PORT: z.string(),
  JWT_SECRET: z.string(),
  FRONTEND_URL: z.string().url(),
  INTERNAL_API_SECRET: z.string(),
  VAPID_PUBLIC_KEY: z.string(),
  VAPID_PRIVATE_KEY: z.string(),
  VAPID_SUBJECT: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  MAILERSEND_API_KEY: z.string(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error(" Invalid Env Variables:", _env.error.format());
  process.exit(1);
}

export const env = _env.data;
