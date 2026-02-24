const rateLimit = require("express-rate-limit");
const appConfig = require("../config/app.config");

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: appConfig.rateLimit.windowMs, // 15 minutes
  max: appConfig.rateLimit.max, // limit each IP
  message: {
    success: false,
    status: "fail",
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Stricter rate limiter for auth routes (login, register, etc.)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 min
  message: {
    success: false,
    status: "fail",
    message:
      "Too many authentication attempts, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, authLimiter };
