const CryptoJS = require("crypto-js");
const appConfig = require("../config/app.config");

const SECRET_KEY = appConfig.encryptionKey;

/**
 * Encrypt a string value
 * @param {string} text - Plain text to encrypt
 * @returns {string} Encrypted text
 */
const encrypt = (text) => {
  if (!text) return text;
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

/**
 * Decrypt an encrypted string
 * @param {string} cipherText - Encrypted text
 * @returns {string} Decrypted plain text
 */
const decrypt = (cipherText) => {
  if (!cipherText) return cipherText;
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = { encrypt, decrypt };
