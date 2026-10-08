import { opentelemetry } from "@elysia/opentelemetry";
import cors from "@elysiajs/cors";
import Elysia from "elysia";
import { helmet } from "elysia-helmet";
import healthController from "./controllers/HealthController";
import apiRoutes from "./routes/apiRoutes";
import cronRoutes from "./routes/cronRoutes";
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
    this.app.get("/health", async (c: any) => healthController.check(c));
    this.app.get("/ping", async (c: any) => healthController.check(c));
  }

  private middlewares() {
    this.app.use(helmet());
    this.app.use(cors({ origin: resolveCorsOrigins() }));
    // Tracing bawaan Elysia. Tanpa konfigurasi, plugin otomatis memakai
    // OTLP http/protobuf ke http://localhost:4318 (OTEL_EXPORTER_OTLP_ENDPOINT).
    // Tanpa collector di sana, span dibuat tapi tidak dikirim ke mana pun.
    this.app.use(opentelemetry({ serviceName: "simad-be" }));
    const lifecycle = new Lifecycle(this.app);
    lifecycle.setup();
    this.app.use(cronRoutes);
    this.app.use(apiRoutes);
  }
}

export default new App().app;
