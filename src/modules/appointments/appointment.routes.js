const { Router } = require("express");
const appointmentController = require("./appointment.controller");
const validate = require("../../core/middlewares/validate.middleware");
const { authenticate } = require("../../core/middlewares/auth.middleware");
const authorize = require("../../core/middlewares/role.middleware");
const { ROLES } = require("../../core/config/constants");
const { bookAppointmentSchema } = require("./appointment.validation");

const router = Router();

// POST /api/appointments — Patient books an appointment
router.post(
  "/",
  authenticate,
  authorize(ROLES.PATIENT),
  validate(bookAppointmentSchema),
  appointmentController.bookAppointment,
);

module.exports = router;
