import jwt from "jsonwebtoken";
import appConfig from "../config/app.config.js";

/**
 * Generate a JWT token
 * @param {Object} payload - Data to encode in token { userId, role }
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, appConfig.jwt.secret, {
    expiresIn: appConfig.jwt.expiresIn,
  });
};

export { generateToken };
