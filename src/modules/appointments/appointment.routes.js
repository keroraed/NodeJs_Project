import { Router } from "express";
import appointmentController from "./appointment.controller.js";
import validate from "../../core/middlewares/validate.middleware.js";
import { authenticate } from "../../core/middlewares/auth.middleware.js";
import authorize from "../../core/middlewares/role.middleware.js";
import { ROLES } from "../../core/config/constants.js";
import { bookAppointmentSchema } from "./appointment.validation.js";

const router = Router();

// POST /api/appointments — Patient books an appointment
router.post(
  "/",
  authenticate,
  authorize(ROLES.PATIENT),
  validate(bookAppointmentSchema),
  appointmentController.bookAppointment,
);

export default router;
