import type { Server } from 'bun';
import app from './app';
import { connectWithRetry, disconnectDatabase } from './config/databases';
import { env } from './config/env.config';

const SHUTDOWN_TIMEOUT_MS = 10_000;

let isShuttingDown = false;

async function start(): Promise<void> {
  try {
    await connectWithRetry();

    app.listen(env.PORT, () => {
      console.log(`Server is running on http://localhost:${env.PORT} (${env.NODE_ENV})`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    await disconnectDatabase().catch(() => {});
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
    console.warn(
      `Timeout reached with ${server.pendingRequests} in-flight request(s) still pending.`,
    );
  }
}

async function shutdown(signal: string, exitCode = 0): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`Shutting down (${signal})...`);

  const server = app.server;

  try {
    // 1. Stop accepting new connections; let in-flight requests finish first.
    await app.stop(false);
    await waitForInFlightRequests(server);

    // 2. Disconnect the database only after all queries have completed.
    await disconnectDatabase();
    console.log('Database disconnected.');
  } catch (error) {
    console.error('Error during shutdown:', error instanceof Error ? error.message : error);
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
  console.error('Uncaught exception:', error);
  void shutdown('uncaughtException', 1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  void shutdown('unhandledRejection', 1);
});

void start();
