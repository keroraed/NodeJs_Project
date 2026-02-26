/**
 * Seed script to populate medical specialties
 * Run with: npm run seed:specialties
 */
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Specialty from "../src/modules/specialties/specialty.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const SPECIALTIES = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "General Surgery",
  "Gynecology",
  "Neurology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Rheumatology",
  "Urology",
  "ENT (Ear, Nose & Throat)",
  "General Practice",
  "Nephrology",
  "Hematology",
];

const seedSpecialties = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/medical-appointment-system";

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    let created = 0;
    let skipped = 0;

    for (const name of SPECIALTIES) {
      const existing = await Specialty.findOne({ name });
      if (existing) {
        console.log(`  Skipped (already exists): ${name}`);
        skipped++;
      } else {
        await Specialty.create({ name });
        console.log(`  Created: ${name}`);
        created++;
      }
    }

    console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedSpecialties();
