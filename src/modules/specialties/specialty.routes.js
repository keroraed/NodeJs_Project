import { Router } from "express";
import specialtyController from "./specialty.controller.js";

const router = Router();

// GET /api/specialties — Public: List all specialties
router.get("/", specialtyController.getAllSpecialties);

export default router;
