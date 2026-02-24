const { Router } = require("express");
const doctorController = require("./doctor.controller");
const validate = require("../../core/middlewares/validate.middleware");
const {
  authenticate,
  optionalAuth,
} = require("../../core/middlewares/auth.middleware");
const authorize = require("../../core/middlewares/role.middleware");
const { ROLES } = require("../../core/config/constants");
const {
  updateDoctorProfileSchema,
  updateAppointmentSchema,
  getDoctorByIdSchema,
} = require("./doctor.validation");

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

module.exports = router;
