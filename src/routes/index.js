import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import patientRoutes from "../modules/patients/patient.routes.js";
import doctorRoutes from "../modules/doctors/doctor.routes.js";
import appointmentRoutes from "../modules/appointments/appointment.routes.js";
import specialtyRoutes from "../modules/specialties/specialty.routes.js";
import adminRoutes from "../modules/admin/admin.routes.js";

const router = Router();

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Medical Appointment System API is running",
    timestamp: new Date().toISOString(),
  });
});

// Module routes
router.use("/auth", authRoutes);
router.use("/patients", patientRoutes);
router.use("/doctors", doctorRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/specialties", specialtyRoutes);
router.use("/admin", adminRoutes);

export default router;
