import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import "express-async-errors";
import swaggerUi from "swagger-ui-express";

import swaggerDefinition from "./core/config/swagger.config.js";
import routes from "./routes/index.js";
import {
  errorHandler,
  notFoundHandler,
} from "./core/middlewares/error.middleware.js";
import { apiLimiter } from "./core/middlewares/rateLimit.middleware.js";
import logger from "./core/logger/logger.js";

const app = express();

// ── Swagger UI (mounted before helmet so CSP does not block assets) ──────────
app.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDefinition, {
    customSiteTitle: "Medical Appointment API",
    customCss: `
      .swagger-ui .topbar { background-color: #1a6e3c; }
      .swagger-ui .topbar .topbar-wrapper .link span { display: none; }
      .swagger-ui .topbar .topbar-wrapper::before {
        content: "🏥 Medical Appointment System";
        color: #fff;
        font-size: 1.1rem;
        font-weight: 600;
        padding-left: 8px;
      }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
    },
  }),
);

// Security headers (after swagger so the UI assets are not blocked)
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: { write: (message) => logger.info(message.trim()) },
    }),
  );
}

// Global rate limiter
app.use("/api", apiLimiter);

// API routes
app.use("/api", routes);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
