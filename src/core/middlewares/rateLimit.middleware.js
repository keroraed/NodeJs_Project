import rateLimit from "express-rate-limit";
import appConfig from "../config/app.config.js";


const apiLimiter = rateLimit({
  windowMs: appConfig.rateLimit.windowMs,
  max: appConfig.rateLimit.max,
  message: {
    success: false,
    status: "fail",
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Chat endpoints are high-frequency — handled by their own limiter
  skip: (req) => req.path.startsWith("/chat"),
});

// Permissive limiter for chat — 300 requests per minute per IP
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: {
    success: false,
    status: "fail",
    message: "Too many chat requests, please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: {
    success: false,
    status: "fail",
    message:
      "Too many authentication attempts, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export { apiLimiter, authLimiter, chatLimiter };
