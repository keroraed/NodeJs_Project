const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const SALT_ROUNDS = 12;

/**
 * Hash a plain text string (password)
 * @param {string} plainText
 * @returns {Promise<string>} hashed string
 */
const hashValue = async (plainText) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(plainText, salt);
};

/**
 * Compare plain text with a hashed value
 * @param {string} plainText
 * @param {string} hashed
 * @returns {Promise<boolean>}
 */
const compareValue = async (plainText, hashed) => {
  return bcrypt.compare(plainText, hashed);
};

/**
 * Create a deterministic SHA-256 hash (for reset tokens)
 * @param {string} token
 * @returns {string} hex hash
 */
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = { hashValue, compareValue, hashToken };
