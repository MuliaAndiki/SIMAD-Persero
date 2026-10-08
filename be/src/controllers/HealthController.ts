import { pingDatabase } from '@/config/databases';
import type { AppContext } from '@/contex';
import { HttpResponse } from '@/http';
import { getLogger } from '@/utils/logger';

class HealthController {
  /**
   * Ping / Health check backend service and database connection.
   * Wakes up both the Bun HTTP server and PostgreSQL connection pool.
   * GET /health, GET /ping, GET /api/v1/health, GET /api/v1/health/ping
   */
  public async check(c: AppContext) {
    try {
      const dbResult = await pingDatabase();

      const payload = {
        status: 'healthy',
        server: 'online',
        database: 'connected',
        latencyMs: dbResult.latencyMs,
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.round(process.uptime()),
      };

      if (!c?.json) {
        return Response.json({
          status: 200,
          title: 'Berhasil',
          message: `Service and database active (${dbResult.latencyMs}ms)`,
          data: payload,
        });
      }

      return HttpResponse(c).ok(
        payload,
        undefined,
        `Service and database active (${dbResult.latencyMs}ms)`,
      );
    } catch (error) {
      getLogger().error({ err: error }, '[health] Database ping failed');

      const errorMessage = `Database connection failed: ${
        error instanceof Error ? error.message : String(error)
      }`;

      if (!c?.json) {
        return Response.json(
          {
            status: 503,
            title: 'Layanan Tidak Tersedia',
            message: errorMessage,
          },
          { status: 503 },
        );
      }

      return HttpResponse(c).serviceUnavailable(errorMessage);
    }
  }

  /**
   * Lightweight server warmup without querying database.
   * GET /api/v1/health/warmup
   */
  public async warmup(c: AppContext) {
    const payload = {
      status: 'online',
      timestamp: new Date().toISOString(),
    };

    if (!c?.json) {
      return Response.json({
        status: 200,
        title: 'Berhasil',
        message: 'Service warmup successful',
        data: payload,
      });
    }

    return HttpResponse(c).ok(payload, undefined, 'Service warmup successful');
  }
}

export default new HealthController();
