import { createEnv } from '@t3-oss/env-nextjs';
import { NEVER, z } from 'zod';

const requiredString = z.string().trim().min(1, 'This field is required');

export const env = createEnv({
  // Server Environment Variables Configuration
  server: {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    AUTH_SECRET_KEY: requiredString,
    NEXT_INTERNAL_API_SECRET: requiredString,
    NEXT_CLOUDFLARE_ACCOUNT_ID: requiredString,
    NEXT_ACCESS_KEY_ID: requiredString,
    NEXT_SECRET_ACCESS_KEY: requiredString,
  },

  // Client Environment Variables Configuration
  client: {
    NEXT_PUBLIC_APP_URL: requiredString.url(),
    NEXT_PUBLIC_R2_URL: requiredString.url(),
    NEXT_PUBLIC_BACKEND_URL: requiredString.url(),
    NEXT_PUBLIC_BASEPATH: requiredString,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: requiredString,
  },

  // Runtime Environment Variables Configuration
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    AUTH_SECRET_KEY: process.env.AUTH_SECRET_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_BASEPATH: process.env.NEXT_PUBLIC_BASEPATH,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,

    NEXT_INTERNAL_API_SECRET: process.env.NEXT_INTERNAL_API_SECRET,
    NEXT_CLOUDFLARE_ACCOUNT_ID: process.env.NEXT_CLOUDFLARE_ACCOUNT_ID,
    NEXT_ACCESS_KEY_ID: process.env.NEXT_ACCESS_KEY_ID,
    NEXT_PUBLIC_R2_URL: process.env.NEXT_PUBLIC_R2_URL,
    NEXT_SECRET_ACCESS_KEY: process.env.NEXT_SECRET_ACCESS_KEY,
  },

  // Skip Validation for the following Environment Variables
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  // Make empty strings from Environment Variables as undefined
  emptyStringAsUndefined: true,
});
