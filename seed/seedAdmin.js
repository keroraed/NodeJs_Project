/**
 * Seed script to create the initial admin user
 * Run with: npm run seed
 */
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import User from "../src/modules/users/user.model.js";
import { hashValue } from "../src/core/utils/hash.util.js";
import { ROLES } from "../src/core/config/constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const ADMIN_DATA = {
  name: "Admin",
  email: "admin@clinic.com",
  password: "Admin@123",
  role: ROLES.ADMIN,
  isVerified: true,
  isActive: true,
};

const seedAdmin = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/medical-appointment-system";

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    const existingAdmin = await User.findOne({ email: ADMIN_DATA.email });

    if (existingAdmin) {
      console.log("Admin user already exists. Skipping seed.");
      await mongoose.disconnect();
      process.exit(0);
    }

    const hashedPassword = await hashValue(ADMIN_DATA.password);

    const admin = await User.create({
      ...ADMIN_DATA,
      password: hashedPassword,
    });

    console.log("Admin user seeded successfully:");
    console.log(`  Name:     ${admin.name}`);
    console.log(`  Email:    ${admin.email}`);
    console.log(`  Password: ${ADMIN_DATA.password}`);
    console.log(`  Role:     ${admin.role}`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedAdmin();
