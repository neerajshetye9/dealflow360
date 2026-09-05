import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/environment";
import { verifyDatabaseConnection } from "./config/database";
import { logger } from "./config/logger";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { requestNotFoundHandler } from "./middlewares/requestNotFoundHandler";
import { mountAllRoutes } from "./routes/index";

const app = express();

// ── Security & Parsing Middleware ──────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));


// ── Root & Health Check ───────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    name: "DealFlow360 API",
    version: "1.0.0",
    status: "online",
    message: "DealFlow360 Intelligent Sales Operations & Governance Backend is active.",
    endpoints: {
      health: "/health",
      apiBase: "/api",
      auth: "/api/auth",
      products: "/api/products",
      quotations: "/api/quotations",
      approvals: "/api/approvals",
      fulfillment: "/api/fulfillment",
      subscriptions: "/api/subscriptions",
      invoices: "/api/invoices",
      reports: "/api/reports"
    }
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "healthy", service: "dealflow360-backend", timestamp: new Date().toISOString() });
});

app.get("/api", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "DealFlow360 API Root",
    availableModules: [
      "/api/auth",
      "/api/products",
      "/api/price-lists",
      "/api/discount-rules",
      "/api/approvals",
      "/api/portal",
      "/api/quotations",
      "/api/deal-health",
      "/api/fulfillment",
      "/api/subscriptions",
      "/api/invoices",
      "/api/reports"
    ]
  });
});

// ── API Routes ─────────────────────────────────────────────────────────────
mountAllRoutes(app);

// ── 404 & Global Error Handlers ────────────────────────────────────────────
app.use(requestNotFoundHandler);
app.use(globalErrorHandler);

// ── Startup ────────────────────────────────────────────────────────────────
async function startServer(): Promise<void> {
  await verifyDatabaseConnection();

  const port = parseInt(env.PORT, 10);
  app.listen(port, () => {
    logger.info(`DealFlow360 backend running on http://localhost:${port}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
  });
}

startServer().catch((startupError) => {
  logger.error("Failed to start server:", startupError);
  process.exit(1);
});

export { app };
