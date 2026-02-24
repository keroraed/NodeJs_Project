const { Router } = require("express");
const specialtyController = require("./specialty.controller");

const router = Router();

// GET /api/specialties — Public: List all specialties
router.get("/", specialtyController.getAllSpecialties);

module.exports = router;
