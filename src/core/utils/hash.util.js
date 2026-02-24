const bcrypt = require("bcryptjs");

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

module.exports = { hashValue, compareValue };
