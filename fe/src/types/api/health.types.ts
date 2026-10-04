/**
 * Tipe payload & respons modul Health (Backend & Database Ping).
 */

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  server: 'online' | 'offline';
  database: 'connected' | 'disconnected';
  latencyMs: number;
  timestamp: string;
  uptimeSeconds?: number;
}
