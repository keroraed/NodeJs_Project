const { Router } = require("express");
const specialtyService = require("./specialty.service");

const router = Router();

// GET /api/specialties — Public: List all specialties
router.get("/", async (req, res) => {
  const specialties = await specialtyService.getAllSpecialties();
  res.status(200).json({ success: true, data: specialties });
});

module.exports = router;
