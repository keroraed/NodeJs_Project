import ApiError from "../errors/ApiError.js";
import logger from "../logger/logger.js";

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(err.message, { stack: err.stack });

  // If error is an ApiError (operational)
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      errors: err.errors.length > 0 ? err.errors : undefined,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      status: "fail",
      message: "Validation Error",
      errors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      status: "fail",
      message: `${field} already exists`,
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      status: "fail",
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      status: "fail",
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      status: "fail",
      message: "Token has expired",
    });
  }

  // Unknown / unhandled error
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    status: "error",
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
  });
};

/**
 * 404 Not Found middleware
 */
const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
};

export { errorHandler, notFoundHandler };
