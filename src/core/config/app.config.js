const env = require("./env");

const appConfig = {
  // Server
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  isDev: env.NODE_ENV === "development",
  isProd: env.NODE_ENV === "production",

  // Database
  mongoUri: env.MONGODB_URI,

  // JWT
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },

  // Email
  email: {
    senderEmail: env.SENDER_EMAIL,
    username: env.EMAIL_USERNAME,
    password: env.EMAIL_PASSWORD,
    smtpServer: env.SMTP_SERVER,
    smtpPort: env.SMTP_PORT,
  },

  // Encryption
  encryptionKey: env.ENCRYPTION_KEY,

  // Rate Limit
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
  },

  // Frontend
  frontendUrl: env.FRONTEND_URL,
};

module.exports = appConfig;
