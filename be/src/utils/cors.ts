import { env } from "../config/env.config";

const DEFAULT_CORS_ORIGINS = [
  "http://localhost:3000",
  "https://simad-persero.vercel.app",
];

export function resolveCorsOrigins(): string[] {
  const extras = (env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [...new Set([...DEFAULT_CORS_ORIGINS, env.FRONTEND_URL, ...extras])];
}
