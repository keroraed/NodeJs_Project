/**
 * Seed script to create the initial admin user
 * Run with: npm run seed
 */
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const User = require("../src/modules/users/user.model");
const { hashValue } = require("../src/core/utils/hash.util");
const { ROLES } = require("../src/core/config/constants");

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
