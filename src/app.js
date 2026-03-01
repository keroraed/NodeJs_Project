import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import "express-async-errors";
import { fileURLToPath } from "url";
import path from "path";

import routes from "./routes/index.js";
import {
  errorHandler,
  notFoundHandler,
} from "./core/middlewares/error.middleware.js";
import { apiLimiter, chatLimiter } from "./core/middlewares/rateLimit.middleware.js";
import logger from "./core/logger/logger.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: { write: (message) => logger.info(message.trim()) },
    }),
  );
}

app.use("/api", apiLimiter);
app.use("/api/chat", chatLimiter);

app.use("/api", routes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
