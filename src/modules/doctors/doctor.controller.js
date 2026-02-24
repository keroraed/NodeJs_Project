const doctorService = require("./doctor.service");

class DoctorController {
  /**
   * GET /api/doctors/profile
   */
  async getProfile(req, res) {
    const doctor = await doctorService.getOwnProfile(req.user._id);
    res.status(200).json({ success: true, data: doctor });
  }

  /**
   * PUT /api/doctors/profile
   */
  async updateProfile(req, res) {
    const doctor = await doctorService.updateProfile(req.user._id, req.body);
    res.status(200).json({ success: true, data: doctor });
  }

  /**
   * GET /api/doctors/appointments
   */
  async getAppointments(req, res) {
    const result = await doctorService.getOwnAppointments(
      req.user._id,
      req.query,
    );
    res.status(200).json({ success: true, ...result });
  }

  /**
   * PATCH /api/doctors/appointments/:id
   */
  async updateAppointment(req, res) {
    const appointment = await doctorService.updateAppointment(
      req.user._id,
      req.params.id,
      req.body,
    );
    res.status(200).json({ success: true, data: appointment });
  }

  /**
   * GET /api/doctors — Public (admin sees all)
   */
  async listDoctors(req, res) {
    if (req.user && req.user.role === "admin") {
      const result = await doctorService.listAllDoctors(req.query);
      return res.status(200).json({ success: true, ...result });
    }
    const result = await doctorService.listApprovedDoctors(req.query);
    res.status(200).json({ success: true, ...result });
  }

  /**
   * GET /api/doctors/:id — Public
   */
  async getDoctorById(req, res) {
    const doctor = await doctorService.getDoctorById(req.params.id);
    res.status(200).json({ success: true, data: doctor });
  }

  /**
   * GET /api/doctors/:id/availability — Patient
   */
  async getDoctorAvailability(req, res) {
    const availability = await doctorService.getDoctorAvailability(
      req.params.id,
    );
    res.status(200).json({ success: true, data: availability });
  }
}

module.exports = new DoctorController();
