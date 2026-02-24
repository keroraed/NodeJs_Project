const { Router } = require("express");
const authRoutes = require("../modules/auth/auth.routes");
const patientRoutes = require("../modules/patients/patient.routes");
const doctorRoutes = require("../modules/doctors/doctor.routes");
const appointmentRoutes = require("../modules/appointments/appointment.routes");
const specialtyRoutes = require("../modules/specialties/specialty.routes");
const adminRoutes = require("../modules/admin/admin.routes");

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

module.exports = router;
