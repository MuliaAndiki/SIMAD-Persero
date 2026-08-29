import { opentelemetry } from "@elysia/opentelemetry";
import cors from "@elysiajs/cors";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import Elysia from "elysia";
import { helmet } from "elysia-helmet";
import apiRoutes from "./routes/apiRoutes";
import cronRoutes from "./routes/cronRoutes";
import {
  OTEL_ENABLED,
  OTEL_ENDPOINT,
  SERVICE_NAME,
} from "./telemetry/otel.config";
import { Lifecycle } from "./utils/lifecycle";
import { resolveCorsOrigins } from "./utils/cors";

class App {
  public app: Elysia;

  constructor() {
    this.app = new Elysia();
    this.middlewares();
    this.routes();
  }

  private routes(): void {
    this.app.get("/", () => "Hello Elysia! Bun js");
  }

  private middlewares() {
    this.app.use(helmet());
    this.app.use(cors({ origin: resolveCorsOrigins() }));
    this.telemetry();
    const lifecycle = new Lifecycle(this.app);
    lifecycle.setup();
    this.app.use(cronRoutes);
    this.app.use(apiRoutes);
  }

  private telemetry() {
    if (!OTEL_ENABLED) return;
    this.app.use(
      opentelemetry({
        serviceName: SERVICE_NAME,
        spanProcessors: [
          new BatchSpanProcessor(
            new OTLPTraceExporter({ url: `${OTEL_ENDPOINT}/v1/traces` }),
          ),
        ],
      }),
    );
  }
}

export default new App().app;
