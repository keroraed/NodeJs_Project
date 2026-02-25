import specialtyService from "./specialty.service.js";

class SpecialtyController {
  /**
   * GET /api/specialties
   */
  async getAllSpecialties(req, res) {
    const specialties = await specialtyService.getAllSpecialties();
    res.status(200).json({ success: true, data: specialties });
  }
}

export default new SpecialtyController();
