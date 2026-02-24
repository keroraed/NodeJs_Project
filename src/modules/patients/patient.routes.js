const { Router } = require("express");
const patientController = require("./patient.controller");
const validate = require("../../core/middlewares/validate.middleware");
const { authenticate } = require("../../core/middlewares/auth.middleware");
const authorize = require("../../core/middlewares/role.middleware");
const { ROLES } = require("../../core/config/constants");
const {
  updatePatientProfileSchema,
  updateAppointmentSchema,
} = require("./patient.validation");

const router = Router();

// All patient routes require authentication + patient role
router.use(authenticate, authorize(ROLES.PATIENT));

// GET /api/patients/profile
router.get("/profile", patientController.getProfile);

// PUT /api/patients/profile
router.put(
  "/profile",
  validate(updatePatientProfileSchema),
  patientController.updateProfile,
);

// GET /api/patients/appointments
router.get("/appointments", patientController.getAppointments);

// PATCH /api/patients/appointments/:id — Cancel or reschedule
router.patch(
  "/appointments/:id",
  validate(updateAppointmentSchema),
  patientController.updateAppointment,
);

module.exports = router;
