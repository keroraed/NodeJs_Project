import patientService from "./patient.service.js";

class PatientController {
  /**
   * GET /api/patients/profile
   */
  async getProfile(req, res) {
    const patient = await patientService.getProfile(req.user._id);
    res.status(200).json({ success: true, data: patient });
  }

  /**
   * PUT /api/patients/profile
   */
  async updateProfile(req, res) {
    const patient = await patientService.updateProfile(req.user._id, req.body);
    res.status(200).json({ success: true, data: patient });
  }

  /**
   * GET /api/patients/appointments
   */
  async getAppointments(req, res) {
    const result = await patientService.getAppointments(
      req.user._id,
      req.query,
    );
    res.status(200).json({ success: true, ...result });
  }

  /**
   * PATCH /api/patients/appointments/:id
   */
  async updateAppointment(req, res) {
    const appointment = await patientService.updateAppointment(
      req.user._id,
      req.params.id,
      req.body,
    );
    res.status(200).json({ success: true, data: appointment });
  }
}

export default new PatientController();
