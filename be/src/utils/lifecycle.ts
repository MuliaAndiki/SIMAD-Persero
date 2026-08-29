// lifecycle.ts
import { StatusMap, Elysia } from "elysia";
import {
  getLogger,
  recordRequestEnd,
  recordRequestStart,
  statusClass,
} from "@/telemetry/otel.config";
import { getFriendlyErrorMessage } from "../http";
import type { RequestStore } from "../types/request.type";

function resolveStatus(c: any, error?: unknown): number {
  const status = c.set.status as any;
  if (typeof status === "number") return status;
  if (typeof status === "string" && status in StatusMap)
    return StatusMap[status as keyof typeof StatusMap];
  if (error && typeof error === "object" && "status" in error)
    return (error as any).status;
  return 200;
}

export class Lifecycle {
  constructor(private app: Elysia) {}

  public setup() {
    this.app.onRequest((c: any) => {
      const store = c.store as RequestStore;
      store.startedAt = performance.now();
      store.requestId = crypto.randomUUID();
      c.set.headers["X-Request-Id"] = store.requestId;

      const method = c.request.method;
      const rawPath = c.path || new URL(c.request.url).pathname;
      recordRequestStart({ method, route: rawPath });
      store.route = rawPath;
    });

    const finalize = (c: any, error?: unknown) => {
      const store = c.store as RequestStore;
      if (store.finalized) return;
      store.finalized = true;

      const method = c.request.method;
      const matchedRoute = c.route || store.route || c.path;

      const status = resolveStatus(c, error);
      const durationMs = Math.max(
        0,
        Math.round(performance.now() - (store.startedAt ?? performance.now())),
      );
      const statusCls = statusClass(status);

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
        ip: c.request.headers.get("x-forwarded-for") ?? "unknown",
        userAgent: c.request.headers.get("user-agent") ?? "unknown",
      };

      if (error) {
        getLogger().error({ ...logData, err: error }, "request failed");
      } else {
        getLogger().info(logData, "request completed");
      }
    };

    this.app.onAfterHandle((c: any) => finalize(c));
    this.app.onError((c: any) => {
      finalize(c, c.error);
      const code = c.code;
      const error = c.error;

      if (code === "VALIDATION") {
        c.set.status = 400;
        return {
          status: 400,
          message: "Data yang dikirimkan tidak valid atau tidak sesuai format",
          errors: Array.isArray(error?.all)
            ? error.all.map((err: any) => ({
                field: err.path ? String(err.path).replace(/^\//, "") : "body",
                message: err.message || "Nilai tidak valid",
              }))
            : null,
        };
      }

      if (code === "NOT_FOUND") {
        c.set.status = 404;
        return {
          status: 404,
          message: "Resource atau rute tidak ditemukan",
        };
      }

      const { message, status } = getFriendlyErrorMessage(error);
      c.set.status = status;
      return {
        status,
        message,
      };
    });
  }
}
