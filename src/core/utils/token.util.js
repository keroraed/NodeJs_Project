const jwt = require("jsonwebtoken");
const appConfig = require("../config/app.config");

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

module.exports = { generateToken };
