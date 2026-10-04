/**
 * Daftar endpoint modul Health & Warm-up.
 *
 * Path relatif terhadap base URL API gateway (fe/src/configs/repo.config.ts).
 * Disamakan dengan rute backend (be/src/routes/healthRoutes.ts).
 */

export const HEALTH_ENDPOINTS = {
  HEALTH: '/health',
  PING: '/health/ping',
  WARMUP: '/health/warmup',
} as const;
