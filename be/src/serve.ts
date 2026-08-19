import type { Server } from 'bun';
import app from './app';
import { connectWithRetry, disconnectDatabase } from './config/databases';
import { env } from './config/env.config';
import { getLogger, initTelemetry, shutdownTelemetry } from './telemetry/otel.config';

const SHUTDOWN_TIMEOUT_MS = 10_000;

let isShuttingDown = false;

async function start(): Promise<void> {
  try {
    initTelemetry();
    await connectWithRetry();

    app.listen(env.PORT, () => {
      getLogger().info(`Server is running on http://localhost:${env.PORT} (${env.NODE_ENV})`);
    });
  } catch (error) {
    getLogger().error({ err: error }, 'Failed to start server');
    await disconnectDatabase().catch(() => {});
    await shutdownTelemetry().catch(() => {});
    process.exit(1);
  }
}

async function waitForInFlightRequests(
  server: Server<unknown> | null,
  timeoutMs = SHUTDOWN_TIMEOUT_MS,
): Promise<void> {
  if (!server) return;

  const deadline = Date.now() + timeoutMs;
  while (server.pendingRequests > 0 && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  if (server.pendingRequests > 0) {
    getLogger().warn(
      `Timeout reached with ${server.pendingRequests} in-flight request(s) still pending.`,
    );
  }
}

async function shutdown(signal: string, exitCode = 0): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;

  getLogger().info(`Shutting down (${signal})...`);

  const server = app.server;

  try {
    // 1. Stop accepting new connections; let in-flight requests finish first.
    await app.stop(false);
    await waitForInFlightRequests(server);

    // 2. Disconnect the database only after all queries have completed.
    await disconnectDatabase();
    getLogger().info('Database disconnected.');

    // 3. Flush OTel telemetry
    await shutdownTelemetry();
  } catch (error) {
    getLogger().error({ err: error }, 'Error during shutdown');
  }

  process.exit(exitCode);
}

process.once('SIGINT', () => {
  void shutdown('SIGINT');
});

process.once('SIGTERM', () => {
  void shutdown('SIGTERM');
});

process.once('beforeExit', () => {
  void disconnectDatabase();
});

process.on('uncaughtException', (error) => {
  getLogger().error({ err: error }, 'Uncaught exception');
  void shutdown('uncaughtException', 1);
});

process.on('unhandledRejection', (reason) => {
  getLogger().error({ err: reason }, 'Unhandled rejection');
  void shutdown('unhandledRejection', 1);
});

void start();
