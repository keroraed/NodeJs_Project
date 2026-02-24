const appointmentService = require("./appointment.service");

class AppointmentController {
  /**
   * POST /api/appointments — Book an appointment
   */
  async bookAppointment(req, res) {
    const appointment = await appointmentService.bookAppointment(
      req.user._id,
      req.body,
    );
    res.status(201).json({ success: true, data: appointment });
  }
}

module.exports = new AppointmentController();
