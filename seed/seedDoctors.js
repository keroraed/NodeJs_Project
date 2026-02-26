/**
 * Seed script to create 20 doctor profiles
 * Run with: npm run seed:doctors
 */
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import User from "../src/modules/users/user.model.js";
import DoctorProfile from "../src/modules/doctors/doctor.model.js";
import Specialty from "../src/modules/specialties/specialty.model.js";
import { hashValue } from "../src/core/utils/hash.util.js";
import { ROLES } from "../src/core/config/constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const DEFAULT_PASSWORD = "Doctor@123";

const DOCTORS = [
  {
    name: "Dr. Ahmed Kamal",
    email: "ahmed.kamal@clinic.com",
    phone: "01012345601",
    gender: "male",
    dateOfBirth: "1978-04-12",
    specialty: "Cardiology",
    bio: "Board-certified cardiologist with over 15 years of experience in interventional cardiology and heart failure management.",
    availability: [
      { day: "Monday", slots: [{ startTime: "09:00", endTime: "13:00" }, { startTime: "16:00", endTime: "19:00" }] },
      { day: "Wednesday", slots: [{ startTime: "09:00", endTime: "13:00" }] },
      { day: "Saturday", slots: [{ startTime: "10:00", endTime: "14:00" }] },
    ],
  },
  {
    name: "Dr. Sara Mahmoud",
    email: "sara.mahmoud@clinic.com",
    phone: "01012345602",
    gender: "female",
    dateOfBirth: "1985-07-23",
    specialty: "Dermatology",
    bio: "Specialist in medical and cosmetic dermatology with expertise in skin cancer detection, acne treatment, and anti-aging procedures.",
    availability: [
      { day: "Sunday", slots: [{ startTime: "10:00", endTime: "14:00" }] },
      { day: "Tuesday", slots: [{ startTime: "09:00", endTime: "12:00" }, { startTime: "15:00", endTime: "18:00" }] },
      { day: "Thursday", slots: [{ startTime: "10:00", endTime: "14:00" }] },
    ],
  },
  {
    name: "Dr. Mohamed Hassan",
    email: "mohamed.hassan@clinic.com",
    phone: "01012345603",
    gender: "male",
    dateOfBirth: "1975-01-30",
    specialty: "Neurology",
    bio: "Neurologist specializing in stroke management, epilepsy, and neurodegenerative diseases with 20 years of clinical experience.",
    availability: [
      { day: "Monday", slots: [{ startTime: "08:00", endTime: "12:00" }] },
      { day: "Wednesday", slots: [{ startTime: "08:00", endTime: "12:00" }] },
      { day: "Friday", slots: [{ startTime: "09:00", endTime: "13:00" }] },
    ],
  },
  {
    name: "Dr. Nour El-Din Ramzy",
    email: "nour.ramzy@clinic.com",
    phone: "01012345604",
    gender: "male",
    dateOfBirth: "1982-09-15",
    specialty: "Orthopedics",
    bio: "Orthopedic surgeon with extensive experience in joint replacement, sports medicine, and spine surgery.",
    availability: [
      { day: "Tuesday", slots: [{ startTime: "09:00", endTime: "13:00" }] },
      { day: "Thursday", slots: [{ startTime: "09:00", endTime: "13:00" }] },
      { day: "Saturday", slots: [{ startTime: "09:00", endTime: "12:00" }] },
    ],
  },
  {
    name: "Dr. Hana Salah",
    email: "hana.salah@clinic.com",
    phone: "01012345605",
    gender: "female",
    dateOfBirth: "1988-03-08",
    specialty: "Pediatrics",
    bio: "Dedicated pediatrician providing comprehensive care for children from newborns to adolescents, with a focus on preventive medicine.",
    availability: [
      { day: "Sunday", slots: [{ startTime: "09:00", endTime: "13:00" }, { startTime: "16:00", endTime: "19:00" }] },
      { day: "Monday", slots: [{ startTime: "09:00", endTime: "13:00" }] },
      { day: "Wednesday", slots: [{ startTime: "16:00", endTime: "19:00" }] },
    ],
  },
  {
    name: "Dr. Tarek Fouad",
    email: "tarek.fouad@clinic.com",
    phone: "01012345606",
    gender: "male",
    dateOfBirth: "1973-11-20",
    specialty: "Gastroenterology",
    bio: "Gastroenterologist specializing in endoscopy, inflammatory bowel disease, hepatology, and gastrointestinal cancers.",
    availability: [
      { day: "Tuesday", slots: [{ startTime: "10:00", endTime: "14:00" }] },
      { day: "Thursday", slots: [{ startTime: "10:00", endTime: "14:00" }] },
      { day: "Saturday", slots: [{ startTime: "09:00", endTime: "13:00" }] },
    ],
  },
  {
    name: "Dr. Dina Mostafa",
    email: "dina.mostafa@clinic.com",
    phone: "01012345607",
    gender: "female",
    dateOfBirth: "1986-06-14",
    specialty: "Gynecology",
    bio: "Experienced gynecologist and obstetrician specializing in high-risk pregnancies, minimally invasive surgery, and women's reproductive health.",
    availability: [
      { day: "Sunday", slots: [{ startTime: "09:00", endTime: "13:00" }] },
      { day: "Monday", slots: [{ startTime: "15:00", endTime: "19:00" }] },
      { day: "Wednesday", slots: [{ startTime: "09:00", endTime: "13:00" }] },
    ],
  },
  {
    name: "Dr. Khaled Ibrahim",
    email: "khaled.ibrahim@clinic.com",
    phone: "01012345608",
    gender: "male",
    dateOfBirth: "1980-02-25",
    specialty: "Psychiatry",
    bio: "Psychiatrist with expertise in anxiety disorders, depression, cognitive behavioral therapy, and addiction medicine.",
    availability: [
      { day: "Monday", slots: [{ startTime: "11:00", endTime: "15:00" }] },
      { day: "Wednesday", slots: [{ startTime: "11:00", endTime: "15:00" }] },
      { day: "Friday", slots: [{ startTime: "10:00", endTime: "13:00" }] },
    ],
  },
  {
    name: "Dr. Rania Adel",
    email: "rania.adel@clinic.com",
    phone: "01012345609",
    gender: "female",
    dateOfBirth: "1983-10-05",
    specialty: "Endocrinology",
    bio: "Endocrinologist specializing in diabetes management, thyroid disorders, hormonal imbalances, and obesity treatment.",
    availability: [
      { day: "Sunday", slots: [{ startTime: "10:00", endTime: "14:00" }] },
      { day: "Tuesday", slots: [{ startTime: "10:00", endTime: "14:00" }] },
      { day: "Thursday", slots: [{ startTime: "15:00", endTime: "18:00" }] },
    ],
  },
  {
    name: "Dr. Sameh Wahba",
    email: "sameh.wahba@clinic.com",
    phone: "01012345610",
    gender: "male",
    dateOfBirth: "1977-08-19",
    specialty: "Ophthalmology",
    bio: "Ophthalmologist with 18 years of experience in cataract surgery, LASIK, glaucoma management, and retinal disorders.",
    availability: [
      { day: "Monday", slots: [{ startTime: "09:00", endTime: "12:00" }] },
      { day: "Tuesday", slots: [{ startTime: "09:00", endTime: "12:00" }] },
      { day: "Saturday", slots: [{ startTime: "10:00", endTime: "14:00" }] },
    ],
  },
  {
    name: "Dr. Eman Farouk",
    email: "eman.farouk@clinic.com",
    phone: "01012345611",
    gender: "female",
    dateOfBirth: "1987-12-03",
    specialty: "Pulmonology",
    bio: "Pulmonologist specializing in asthma, COPD, sleep disorders, lung cancer screening, and respiratory critical care.",
    availability: [
      { day: "Sunday", slots: [{ startTime: "09:00", endTime: "13:00" }] },
      { day: "Wednesday", slots: [{ startTime: "09:00", endTime: "13:00" }] },
      { day: "Friday", slots: [{ startTime: "09:00", endTime: "12:00" }] },
    ],
  },
  {
    name: "Dr. Amr Sayed",
    email: "amr.sayed@clinic.com",
    phone: "01012345612",
    gender: "male",
    dateOfBirth: "1979-05-17",
    specialty: "Urology",
    bio: "Urologist with expertise in minimally invasive procedures, kidney stones, prostate conditions, and erectile dysfunction.",
    availability: [
      { day: "Monday", slots: [{ startTime: "10:00", endTime: "14:00" }] },
      { day: "Thursday", slots: [{ startTime: "10:00", endTime: "14:00" }] },
      { day: "Saturday", slots: [{ startTime: "09:00", endTime: "12:00" }] },
    ],
  },
  {
    name: "Dr. Mona Gamal",
    email: "mona.gamal@clinic.com",
    phone: "01012345613",
    gender: "female",
    dateOfBirth: "1984-04-28",
    specialty: "Rheumatology",
    bio: "Rheumatologist with clinical expertise in rheumatoid arthritis, lupus, osteoporosis, gout, and autoimmune conditions.",
    availability: [
      { day: "Tuesday", slots: [{ startTime: "09:00", endTime: "13:00" }] },
      { day: "Thursday", slots: [{ startTime: "09:00", endTime: "13:00" }] },
      { day: "Saturday", slots: [{ startTime: "10:00", endTime: "13:00" }] },
    ],
  },
  {
    name: "Dr. Youssef Nabil",
    email: "youssef.nabil@clinic.com",
    phone: "01012345614",
    gender: "male",
    dateOfBirth: "1976-07-11",
    specialty: "Oncology",
    bio: "Medical oncologist specializing in breast, lung, and colorectal cancers with expertise in targeted therapy and immunotherapy.",
    availability: [
      { day: "Sunday", slots: [{ startTime: "09:00", endTime: "13:00" }] },
      { day: "Monday", slots: [{ startTime: "09:00", endTime: "12:00" }] },
      { day: "Wednesday", slots: [{ startTime: "14:00", endTime: "17:00" }] },
    ],
  },
  {
    name: "Dr. Laila Hamdy",
    email: "laila.hamdy@clinic.com",
    phone: "01012345615",
    gender: "female",
    dateOfBirth: "1989-01-22",
    specialty: "ENT (Ear, Nose & Throat)",
    bio: "ENT specialist with expertise in sinusitis, hearing loss, tonsillectomy, and head & neck surgery.",
    availability: [
      { day: "Sunday", slots: [{ startTime: "10:00", endTime: "14:00" }] },
      { day: "Tuesday", slots: [{ startTime: "10:00", endTime: "14:00" }] },
      { day: "Thursday", slots: [{ startTime: "16:00", endTime: "19:00" }] },
    ],
  },
  {
    name: "Dr. Hesham Zaki",
    email: "hesham.zaki@clinic.com",
    phone: "01012345616",
    gender: "male",
    dateOfBirth: "1974-09-09",
    specialty: "Nephrology",
    bio: "Nephrologist with 22 years of experience managing chronic kidney disease, dialysis, and kidney transplant follow-up.",
    availability: [
      { day: "Monday", slots: [{ startTime: "08:00", endTime: "12:00" }] },
      { day: "Wednesday", slots: [{ startTime: "08:00", endTime: "12:00" }] },
      { day: "Saturday", slots: [{ startTime: "09:00", endTime: "12:00" }] },
    ],
  },
  {
    name: "Dr. Noha Sherif",
    email: "noha.sherif@clinic.com",
    phone: "01012345617",
    gender: "female",
    dateOfBirth: "1981-03-14",
    specialty: "Hematology",
    bio: "Hematologist specializing in blood disorders, anemia, clotting diseases, lymphoma, and leukemia management.",
    availability: [
      { day: "Tuesday", slots: [{ startTime: "09:00", endTime: "13:00" }] },
      { day: "Thursday", slots: [{ startTime: "09:00", endTime: "13:00" }] },
      { day: "Saturday", slots: [{ startTime: "10:00", endTime: "13:00" }] },
    ],
  },
  {
    name: "Dr. Bassem Naguib",
    email: "bassem.naguib@clinic.com",
    phone: "01012345618",
    gender: "male",
    dateOfBirth: "1978-06-30",
    specialty: "General Surgery",
    bio: "General surgeon specializing in laparoscopic procedures, hernia repair, appendectomy, and bariatric surgery.",
    availability: [
      { day: "Sunday", slots: [{ startTime: "08:00", endTime: "12:00" }] },
      { day: "Tuesday", slots: [{ startTime: "08:00", endTime: "12:00" }] },
      { day: "Thursday", slots: [{ startTime: "14:00", endTime: "17:00" }] },
    ],
  },
  {
    name: "Dr. Abeer Lotfy",
    email: "abeer.lotfy@clinic.com",
    phone: "01012345619",
    gender: "female",
    dateOfBirth: "1986-11-07",
    specialty: "General Practice",
    bio: "Family medicine physician providing comprehensive primary care for patients of all ages, chronic disease management, and preventive health.",
    availability: [
      { day: "Sunday", slots: [{ startTime: "09:00", endTime: "13:00" }, { startTime: "16:00", endTime: "19:00" }] },
      { day: "Monday", slots: [{ startTime: "09:00", endTime: "13:00" }] },
      { day: "Wednesday", slots: [{ startTime: "09:00", endTime: "13:00" }] },
      { day: "Thursday", slots: [{ startTime: "16:00", endTime: "19:00" }] },
    ],
  },
  {
    name: "Dr. Omar Fathy",
    email: "omar.fathy@clinic.com",
    phone: "01012345620",
    gender: "male",
    dateOfBirth: "1983-08-25",
    specialty: "Radiology",
    bio: "Radiologist with expertise in diagnostic imaging, interventional radiology, MRI, CT scans, and ultrasound-guided procedures.",
    availability: [
      { day: "Monday", slots: [{ startTime: "09:00", endTime: "13:00" }] },
      { day: "Tuesday", slots: [{ startTime: "09:00", endTime: "13:00" }] },
      { day: "Wednesday", slots: [{ startTime: "09:00", endTime: "13:00" }] },
    ],
  },
];

const seedDoctors = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/medical-appointment-system";

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB\n");

    const hashedPassword = await hashValue(DEFAULT_PASSWORD);
    let created = 0;
    let skipped = 0;

    for (const doctorData of DOCTORS) {
      // Find specialty
      const specialty = await Specialty.findOne({ name: doctorData.specialty });
      if (!specialty) {
        console.warn(`  ⚠ Specialty not found: "${doctorData.specialty}" — run seed:specialties first`);
        skipped++;
        continue;
      }

      // Skip if user already exists
      const existingUser = await User.findOne({ email: doctorData.email });
      if (existingUser) {
        console.log(`  Skipped (already exists): ${doctorData.name}`);
        skipped++;
        continue;
      }

      // Create user
      const user = await User.create({
        name: doctorData.name,
        email: doctorData.email,
        password: hashedPassword,
        role: ROLES.DOCTOR,
        phone: doctorData.phone,
        gender: doctorData.gender,
        dateOfBirth: new Date(doctorData.dateOfBirth),
        isVerified: true,
        isActive: true,
      });

      // Create doctor profile
      await DoctorProfile.create({
        user: user._id,
        specialty: specialty._id,
        bio: doctorData.bio,
        isApproved: true,
        availability: doctorData.availability,
      });

      console.log(`  Created: ${doctorData.name} (${doctorData.specialty})`);
      created++;
    }

    console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);
    console.log(`\nDefault password for all doctors: ${DEFAULT_PASSWORD}`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDoctors();
