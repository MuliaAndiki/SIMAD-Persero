import type { AppContext } from '@/contex';
import { HttpResponse } from '@/http';
import cleanupService from '@/services/cleanup.service';
import internshipService from '@/services/internship.service';
import { pingDatabase } from '@/config/databases';
import { getLogger } from '@/telemetry/otel.config';

class CronController {
  /**
   * Ping / Warm-up database to prevent cold starts before executing other cron jobs
   * GET/POST /cron/ping
   */
  public async pingDatabase(c: AppContext) {
    try {
      const result = await pingDatabase();

      return HttpResponse(c).ok(
        {
          database: 'connected',
          latency: `${result.latencyMs}ms`,
          timestamp: new Date().toISOString(),
        },
        undefined,
        `Database warm-up successful (${result.latencyMs}ms)`,
      );
    } catch (error) {
      getLogger().error({ err: error }, '[cron] Database ping failed');
      return HttpResponse(c).serviceUnavailable(
        `Database ping failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  public async autoStartInternships(c: AppContext) {
    const result = await internshipService.autoStartDueInternships();

    return HttpResponse(c).ok(
      result,
      undefined,
      `Success auto-start scheduled job. Processed: ${result.processed}, Started: ${result.started}`,
    );
  }

  /**
   * Preview inactive users yang akan dihapus
   * GET /api/cron/cleanup/preview?gracePeriod=30
   */
  public async previewInactiveUsers(c: AppContext) {
    const gracePeriod = Number(c.query.gracePeriod) || 30;
    const result = await cleanupService.getInactiveUsersCount(gracePeriod);

    return HttpResponse(c).ok(result, undefined, `Found ${result.count} inactive users eligible for deletion.`);
  }

  /**
   * Hapus user yang sudah dinonaktifkan
   * POST /api/cron/cleanup/users?gracePeriod=30
   * 
   * IMPORTANT: Ini adalah operasi PERMANEN dan tidak bisa di-undo!
   * Pastikan sudah review dengan endpoint /cleanup/preview terlebih dahulu.
   */
  public async deleteInactiveUsers(c: AppContext) {
    const gracePeriod = Number(c.query.gracePeriod) || 30;
    
    // Gunakan system user ID atau user yang menjalankan cron
    const systemUserId = c.user?.id;

    const result = await cleanupService.deleteInactiveUsers(gracePeriod, systemUserId);

    return HttpResponse(c).ok(
      result,
      undefined,
      `Cleanup completed. Deleted ${result.deletedCount} inactive users.`,
    );
  }

  /**
   * Hapus orphaned files
   * POST /api/cron/cleanup/files?gracePeriod=60
   */
  public async deleteOrphanedFiles(c: AppContext) {
    const gracePeriod = Number(c.query.gracePeriod) || 60;
    const result = await cleanupService.deleteOrphanedFiles(gracePeriod);

    return HttpResponse(c).ok(
      result,
      undefined,
      `Cleanup completed. Deleted ${result.deletedCount} orphaned files.`,
    );
  }
}

export default new CronController();
