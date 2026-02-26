import { Router } from "express";
import doctorController from "./doctor.controller.js";
import validate from "../../core/middlewares/validate.middleware.js";
import {
  authenticate,
  optionalAuth,
} from "../../core/middlewares/auth.middleware.js";
import authorize from "../../core/middlewares/role.middleware.js";
import { ROLES } from "../../core/config/constants.js";
import {
  updateDoctorProfileSchema,
  updateAppointmentSchema,
  getDoctorByIdSchema,
} from "./doctor.validation.js";
import upload from "../../core/middlewares/upload.middleware.js";

const router = Router();

// Protected doctor routes (must come before /:id)
router.get(
  "/profile",
  authenticate,
  authorize(ROLES.DOCTOR),
  doctorController.getProfile,
);

router.put(
  "/profile",
  authenticate,
  authorize(ROLES.DOCTOR),
  validate(updateDoctorProfileSchema),
  doctorController.updateProfile,
);

router.patch(
  "/profile/picture",
  authenticate,
  authorize(ROLES.DOCTOR),
  upload.single("profilePicture"),
  doctorController.uploadProfilePicture,
);

router.get(
  "/appointments",
  authenticate,
  authorize(ROLES.DOCTOR),
  doctorController.getAppointments,
);

router.patch(
  "/appointments/:id",
  authenticate,
  authorize(ROLES.DOCTOR),
  validate(updateAppointmentSchema),
  doctorController.updateAppointment,
);

// Public routes
router.get("/", optionalAuth, doctorController.listDoctors);

router.get(
  "/:id",
  validate(getDoctorByIdSchema),
  doctorController.getDoctorById,
);

router.get(
  "/:id/availability",
  validate(getDoctorByIdSchema),
  doctorController.getDoctorAvailability,
);

export default router;
