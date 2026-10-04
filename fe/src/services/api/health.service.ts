import { Api } from '@/api/api-entry';
import type { TResponse } from '@/api/types/response.types';
import { HEALTH_ENDPOINTS } from '@/configs/endpoints/health.endpoints';
import type { HealthResponse } from '@/types/api/health.types';
import { toServiceResponse } from '@/utils/service-response';

const { client } = Api();

class HealthService {
  /**
   * GET /health/ping
   * Ping backend dan koneksi database (wake up cold-start).
   */
  public async Ping(): Promise<TResponse<HealthResponse>> {
    const res = await client.GetResponse<HealthResponse>(HEALTH_ENDPOINTS.PING);
    return toServiceResponse(res, {
      message: 'Koneksi backend dan database aktif',
    });
  }

  /**
   * GET /health/warmup
   * Ping ringan server backend.
   */
  public async Warmup(): Promise<TResponse<{ status: string; timestamp: string }>> {
    const res = await client.GetResponse<{ status: string; timestamp: string }>(
      HEALTH_ENDPOINTS.WARMUP,
    );
    return toServiceResponse(res, {
      message: 'Server backend aktif',
    });
  }
}

export default new HealthService();
