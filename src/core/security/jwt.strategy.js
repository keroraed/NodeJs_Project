import jwt from "jsonwebtoken";
import appConfig from "../config/app.config.js";
import ApiError from "../errors/ApiError.js";

/**
 * Verify a JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded payload { userId, role }
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, appConfig.jwt.secret);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw ApiError.unauthorized("Token has expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw ApiError.unauthorized("Invalid token");
    }
    throw ApiError.unauthorized("Token verification failed");
  }
};

export { verifyToken };
