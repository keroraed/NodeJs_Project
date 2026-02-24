const crypto = require("crypto");
const { OTP_LENGTH } = require("../config/constants");

/**
 * Generate a numeric OTP of specified length
 * @param {number} length - OTP length (default from constants)
 * @returns {string} Generated OTP
 */
const generateOtp = (length = OTP_LENGTH) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  const otp = crypto.randomInt(min, max + 1);
  return otp.toString();
};

module.exports = generateOtp;
