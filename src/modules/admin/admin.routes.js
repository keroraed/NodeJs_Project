const { Router } = require("express");
const adminController = require("./admin.controller");
const validate = require("../../core/middlewares/validate.middleware");
const { authenticate } = require("../../core/middlewares/auth.middleware");
const authorize = require("../../core/middlewares/role.middleware");
const { ROLES } = require("../../core/config/constants");
const {
  objectIdSchema,
  createSpecialtySchema,
  updateSpecialtySchema,
} = require("./admin.validation");

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

module.exports = router;
