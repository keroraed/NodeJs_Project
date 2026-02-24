const adminService = require("./admin.service");

class AdminController {
  /**
   * GET /api/admin/users
   */
  async listUsers(req, res) {
    const result = await adminService.listAllUsers(req.query);
    res.status(200).json({ success: true, ...result });
  }

  /**
   * PATCH /api/admin/doctors/:id/approve
   */
  async approveDoctor(req, res) {
    const doctor = await adminService.approveDoctor(req.params.id);
    res.status(200).json({ success: true, data: doctor });
  }

  /**
   * PATCH /api/admin/users/:id/block
   */
  async blockUnblockUser(req, res) {
    const user = await adminService.blockUnblockUser(
      req.params.id,
      req.user._id,
    );
    res.status(200).json({ success: true, data: user });
  }

  /**
   * GET /api/admin/appointments
   */
  async getAllAppointments(req, res) {
    const result = await adminService.getAllAppointments(req.query);
    res.status(200).json({ success: true, ...result });
  }

  /**
   * POST /api/admin/specialties
   */
  async createSpecialty(req, res) {
    const specialty = await adminService.createSpecialty(req.body);
    res.status(201).json({ success: true, data: specialty });
  }

  /**
   * GET /api/admin/specialties
   */
  async listSpecialties(req, res) {
    const specialties = await adminService.listSpecialties();
    res.status(200).json({ success: true, data: specialties });
  }

  /**
   * PUT /api/admin/specialties/:id
   */
  async updateSpecialty(req, res) {
    const specialty = await adminService.updateSpecialty(
      req.params.id,
      req.body,
    );
    res.status(200).json({ success: true, data: specialty });
  }

  /**
   * DELETE /api/admin/specialties/:id
   */
  async deleteSpecialty(req, res) {
    const result = await adminService.deleteSpecialty(req.params.id);
    res.status(200).json({ success: true, ...result });
  }
}

module.exports = new AdminController();
