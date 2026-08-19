import { opentelemetry } from '@elysia/opentelemetry';
import cors from '@elysiajs/cors';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import Elysia, { StatusMap } from 'elysia';
import { helmet } from 'elysia-helmet';
import type { AppContext } from './contex';
import apiRoutes from './routes/apiRoutes';
import cronRoutes from './routes/cronRoutes';
import {
  OTEL_ENABLED,
  OTEL_ENDPOINT,
  SERVICE_NAME,
  getLogger,
  recordRequestEnd,
  recordRequestStart,
  statusClass,
} from './telemetry/otel.config';
import type { RequestStore } from './types/request.type';
import { resolveCorsOrigins } from './utils/cors';

class App {
  public app: Elysia;

  constructor() {
    this.app = new Elysia();
    this.middlewares();
    this.routes();
  }

  private routes(): void {
    this.app.get('/', () => 'Hello Elysia! Bun js');
  }

  private middlewares() {
    this.app.use(helmet());
    this.app.use(cors({ origin: resolveCorsOrigins() }));
    this.telemetry();
    this.requestLifecycle();
    this.app.use(cronRoutes);
    this.app.use(apiRoutes);
  }

  private telemetry() {
    if (!OTEL_ENABLED) return;
    this.app.use(
      opentelemetry({
        serviceName: SERVICE_NAME,
        spanProcessors: [
          new BatchSpanProcessor(new OTLPTraceExporter({ url: `${OTEL_ENDPOINT}/v1/traces` })),
        ],
      }),
    );
  }

  private requestLifecycle() {
    this.app.onRequest((c: any) => {
      const store = c.store as RequestStore;
      store.startedAt = performance.now();
      store.requestId = crypto.randomUUID();
      c.set.headers['X-Request-Id'] = store.requestId;

      const method = c.request.method;
      // High cardinality, but start has only method + path usually if route isn't available yet
      // So we can omit route during start, or pass "unknown". We'll just pass c.path for now,
      // but in most production apps we only increment active requests, which we do by path.
      // Elysia's `onRequest` might not have `c.route` yet.
      const rawPath = c.path || new URL(c.request.url).pathname;
      recordRequestStart({ method, route: rawPath });

      // Store raw path so we can decrement it properly if needed, but since active requests
      // needs accurate pairing, actually it's better to decrement with the *same* route
      // we incremented with. So we store the incremented route!
      store.route = rawPath;
    });

    const finalize = (c: any, error?: unknown) => {
      const store = c.store as RequestStore;
      if (store.finalized) return;
      store.finalized = true;

      const method = c.request.method;
      // We try to get the matched route pattern from Elysia (c.route),
      // fallback to the one we started with.
      const matchedRoute = c.route || store.route || c.path;

      const status = resolveStatus(c, error);
      const durationMs = Math.max(
        0,
        Math.round(performance.now() - (store.startedAt ?? performance.now())),
      );
      const statusCls = statusClass(status);

      // Decrement the active request constraint using the EXACT same label we incremented with
      recordRequestEnd({
        method,
        route: store.route ?? matchedRoute,
        status,
        status_class: statusCls,
      });

      const logData = {
        requestId: store.requestId,
        method,
        route: matchedRoute,
        status,
        durationMs,
        ip: c.request.headers.get('x-forwarded-for') ?? 'unknown',
        userAgent: c.request.headers.get('user-agent') ?? 'unknown',
      };

      if (error) {
        getLogger().error({ ...logData, err: error }, 'request failed');
      } else {
        getLogger().info(logData, 'request completed');
      }
    };

    this.app.onAfterHandle((c: any) => finalize(c));
    this.app.onError((c: any) => finalize(c, c.error));
  }
}

function resolveStatus(c: any, error?: unknown): number {
  const status = c.set.status as any;
  if (typeof status === 'number') return status;
  if (typeof status === 'string' && status in StatusMap)
    return StatusMap[status as keyof typeof StatusMap];
  if (error && typeof error === 'object' && 'status' in error) return (error as any).status;
  return 200;
}

export default new App().app;
