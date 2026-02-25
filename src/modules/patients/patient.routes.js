import { Router } from "express";
import patientController from "./patient.controller.js";
import validate from "../../core/middlewares/validate.middleware.js";
import { authenticate } from "../../core/middlewares/auth.middleware.js";
import authorize from "../../core/middlewares/role.middleware.js";
import { ROLES } from "../../core/config/constants.js";
import {
  updatePatientProfileSchema,
  updateAppointmentSchema,
} from "./patient.validation.js";

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

export default router;
