import { Router } from "express";
import adminController from "./admin.controller.js";
import validate from "../../core/middlewares/validate.middleware.js";
import { authenticate } from "../../core/middlewares/auth.middleware.js";
import authorize from "../../core/middlewares/role.middleware.js";
import { ROLES } from "../../core/config/constants.js";
import {
  objectIdSchema,
  createSpecialtySchema,
  updateSpecialtySchema,
} from "./admin.validation.js";

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize(ROLES.ADMIN));

// Users
router.get("/users", adminController.listUsers);

// Doctors
router.patch(
  "/doctors/:id/approve",
  validate(objectIdSchema),
  adminController.approveDoctor,
);

// Block/unblock user
router.patch(
  "/users/:id/block",
  validate(objectIdSchema),
  adminController.blockUnblockUser,
);

// Appointments
router.get("/appointments", adminController.getAllAppointments);

// Specialties
router.post(
  "/specialties",
  validate(createSpecialtySchema),
  adminController.createSpecialty,
);

router.get("/specialties", adminController.listSpecialties);

router.put(
  "/specialties/:id",
  validate(updateSpecialtySchema),
  adminController.updateSpecialty,
);

router.delete(
  "/specialties/:id",
  validate(objectIdSchema),
  adminController.deleteSpecialty,
);

export default router;
