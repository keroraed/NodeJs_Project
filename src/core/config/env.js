import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT, 10) || 5000,

  // Database
  MONGODB_URI:
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/medical-appointment-system",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // Email
  SENDER_EMAIL: process.env.SENDER_EMAIL,
  EMAIL_USERNAME: process.env.EMAIL_USERNAME,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  SMTP_SERVER: process.env.SMTP_SERVER || "smtp.gmail.com",
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,

  // Encryption
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,

  // Rate Limit
  RATE_LIMIT_WINDOW_MS:
    parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,

  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
};

// Validate required env vars
const requiredEnvVars = ["JWT_SECRET", "MONGODB_URI"];

for (const varName of requiredEnvVars) {
  if (!env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}

export default env;
