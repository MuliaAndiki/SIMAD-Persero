import { env } from '@/config/env.config';
import { type Counter, type UpDownCounter, context, metrics, trace } from '@opentelemetry/api';
import {
  type Logger as OtelLogger,
  SeverityNumber,
  logs as otelLogs,
} from '@opentelemetry/api-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import pino, { type Logger as PinoLogger } from 'pino';
import pinoPretty from 'pino-pretty';

export const SERVICE_NAME = 'simad-be';
const SERVICE_VERSION = '1.0.0';

export const OTEL_ENABLED = env.OTEL_ENABLED !== 'false';
export const OTEL_ENDPOINT = (env.OTEL_ENDPOINT ?? 'http://localhost:4318').replace(/\/+$/, '');
const LOG_LEVEL = env.LOG_LEVEL ?? 'info';
const IS_PRODUCTION = env.NODE_ENV === 'production';

/** Pemetaan level pino (10/20/30/40/50/60) → OTel SeverityNumber. */
const LEVEL_SEVERITY: Record<number, SeverityNumber> = {
  10: SeverityNumber.TRACE,
  20: SeverityNumber.DEBUG,
  30: SeverityNumber.INFO,
  40: SeverityNumber.WARN,
  50: SeverityNumber.ERROR,
  60: SeverityNumber.FATAL,
};

const LEVEL_TEXT: Record<number, string> = {
  10: 'TRACE',
  20: 'DEBUG',
  30: 'INFO',
  40: 'WARN',
  50: 'ERROR',
  60: 'FATAL',
};

let meterProvider: MeterProvider | null = null;
let loggerProvider: LoggerProvider | null = null;
let otelLogger: OtelLogger | null = null;
let pinoLogger: PinoLogger | null = null;
let activeRequests: UpDownCounter | null = null;
let requestsCounter: Counter | null = null;

/** Tipe atribut yang diterima LogRecord OTel (AnyValueMap). */
type LogAttributes = NonNullable<Parameters<OtelLogger['emit']>[0]['attributes']>;

/**
 * Inisialisasi provider OTel global untuk metrics & logs.
 * Traces dikelola oleh plugin `@elysia/opentelemetry` (NodeSDK).
 * Idempotent — hanya berjalan sekali.
 */
export function initTelemetry(): void {
  if (!OTEL_ENABLED || meterProvider) return;

  const resource = resourceFromAttributes({
    'service.name': SERVICE_NAME,
    'service.version': SERVICE_VERSION,
    'deployment.environment': env.NODE_ENV,
  });

  // ── Metrics: dikirim via OTLP HTTP ke Alloy → Prometheus (remote write) ──
  meterProvider = new MeterProvider({
    resource,
    readers: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: `${OTEL_ENDPOINT}/v1/metrics`,
        }),
        exportIntervalMillis: 15_000,
      }),
    ],
  });
  metrics.setGlobalMeterProvider(meterProvider);

  const meter = metrics.getMeter(SERVICE_NAME);
  activeRequests = meter.createUpDownCounter('http.server.active_requests', {
    description: 'Number of HTTP requests currently in flight',
  });
  requestsCounter = meter.createCounter('http.server.requests', {
    description: 'Total number of HTTP requests handled',
  });

  // ── Logs: pino → OTLP HTTP → Alloy → Loki ──
  loggerProvider = new LoggerProvider({ resource });
  loggerProvider.addLogRecordProcessor(
    new BatchLogRecordProcessor(new OTLPLogExporter({ url: `${OTEL_ENDPOINT}/v1/logs` }), {
      scheduledDelayMillis: 2_000,
      maxQueueSize: 10_000,
    }),
  );
  otelLogs.setGlobalLoggerProvider(loggerProvider);

  otelLogger = otelLogs.getLogger(SERVICE_NAME);
}

/** Flush logs & metrics saat shutdown (dipanggil dari serve.ts). */
export async function shutdownTelemetry(): Promise<void> {
  const jobs: Promise<void>[] = [];
  if (loggerProvider) jobs.push(loggerProvider.shutdown());
  if (meterProvider) jobs.push(meterProvider.shutdown());
  await Promise.allSettled(jobs);
}

/**
 * Logger terstruktur berbasis pino.
 * Selalu tersedia (berfungsi tanpa OTel); saat OTel aktif, setiap log
 * juga di-emit sebagai OTLP LogRecord (dengan trace_id/span_id aktif).
 */
export function getLogger(): PinoLogger {
  if (pinoLogger) return pinoLogger;

  pinoLogger = pino(
    {
      level: LOG_LEVEL,
      base: undefined,
      timestamp: pino.stdTimeFunctions.isoTime,
      hooks: {
        logMethod(args, method, level) {
          emitOtelLog(level, args);
          return method.apply(this, args);
        },
      },
    },
    IS_PRODUCTION
      ? undefined
      : pinoPretty({
          translateTime: 'SYS:HH:MM:ss',
          ignore: 'pid,hostname',
          colorize: true,
          singleLine: true,
        }),
  );

  return pinoLogger;
}

/** Bridge pino → OTel LogRecord. Tidak pernah melempar error. */
function emitOtelLog(level: number, args: unknown[]): void {
  if (!OTEL_ENABLED || !otelLogger) return;

  try {
    let message = '';
    let attributes: LogAttributes | undefined;

    const first = args[0];
    if (first && typeof first === 'object' && !(first instanceof Error)) {
      attributes = first as unknown as LogAttributes;
      message = typeof args[1] === 'string' ? args[1] : '';
      if (args.length > 2) {
        attributes = { ...attributes };
        for (let i = 2; i < args.length; i++) {
          if (args[i] !== undefined) attributes[`pino.arg.${i - 1}`] = toAnyValue(args[i]);
        }
      }
    } else {
      message = args.map((arg) => (typeof arg === 'string' ? arg : safeStringify(arg))).join(' ');
    }

    otelLogger.emit({
      timestamp: Date.now(),
      severityNumber: LEVEL_SEVERITY[level] ?? SeverityNumber.INFO,
      severityText: LEVEL_TEXT[level] ?? 'INFO',
      body: message || undefined,
      attributes,
      context: context.active(),
    });
  } catch {
    // Telemetri tidak boleh pernah merusak logging aplikasi.
  }
}

function safeStringify(value: unknown): string {
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/** Konversi nilai unknown menjadi AnyValue yang valid untuk atribut log OTel. */
function toAnyValue(value: unknown): string | number | boolean | null {
  if (value === null) return null;
  const type = typeof value;
  if (type === 'string' || type === 'number' || type === 'boolean')
    return value as string | number | boolean;
  return safeStringify(value);
}

/** Tambah 1 ke gauge `http.server.active_requests` (dipanggil di onRequest). */
export function recordRequestStart(attributes: {
  method: string;
  route: string;
}): void {
  activeRequests?.add(1, attributes);
}

/** Kurangi 1 dari gauge + tambah 1 ke counter requests (onAfterHandle / onError). */
export function recordRequestEnd(attributes: {
  method: string;
  route: string;
  status: number;
  status_class: string;
}): void {
  activeRequests?.add(-1, attributes);
  requestsCounter?.add(1, attributes);
}

/** Derive OTel semantic label `status_class` (2xx/3xx/4xx/5xx). */
export function statusClass(status: number): string {
  return `${Math.floor(status / 100)}xx`;
}
