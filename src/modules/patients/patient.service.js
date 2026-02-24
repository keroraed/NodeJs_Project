const patientRepository = require("./patient.repository");
const Appointment = require("../appointments/appointment.model");
const appointmentRepository = require("../appointments/appointment.repository");
const ApiError = require("../../core/errors/ApiError");
const {
  getPagination,
  paginatedResponse,
} = require("../../core/utils/pagination.util");

class PatientService {
  /**
   * GET /api/patients/profile — Get own profile
   */
  async getProfile(userId) {
    const patient = await patientRepository.findByUserId(userId);
    if (!patient) {
      throw ApiError.notFound("Patient profile not found");
    }
    return patient;
  }

  /**
   * PUT /api/patients/profile — Update profile
   */
  async updateProfile(userId, updateData) {
    const patient = await patientRepository.findByUserId(userId);
    if (!patient) {
      throw ApiError.notFound("Patient profile not found");
    }
    return patientRepository.updateByUserId(userId, updateData);
  }

  /**
   * GET /api/patients/appointments — List own appointments
   */
  async getAppointments(userId, query) {
    const patient = await patientRepository.findByUserId(userId);
    if (!patient) {
      throw ApiError.notFound("Patient profile not found");
    }

    const { page, limit, skip } = getPagination(query);
    const filter = {};
    if (query.status) filter.status = query.status;

    const { appointments, total } = await appointmentRepository.findByPatient(
      patient._id,
      filter,
      skip,
      limit,
    );

    return paginatedResponse(appointments, total, page, limit);
  }

  /**
   * PATCH /api/patients/appointments/:id — Cancel or reschedule
   */
  async updateAppointment(userId, appointmentId, updateData) {
    const patient = await patientRepository.findByUserId(userId);
    if (!patient) {
      throw ApiError.notFound("Patient profile not found");
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patient: patient._id,
    });
    if (!appointment) {
      throw ApiError.notFound("Appointment not found");
    }

    // Cancel
    if (updateData.status === "cancelled") {
      if (appointment.status === "cancelled") {
        throw ApiError.badRequest("Appointment is already cancelled");
      }
      appointment.status = "cancelled";
      await appointment.save();
      return appointment;
    }

    // Reschedule
    if (updateData.date || updateData.startTime || updateData.endTime) {
      const newDate = updateData.date || appointment.date;
      const newStartTime = updateData.startTime || appointment.startTime;
      const newEndTime = updateData.endTime || appointment.endTime;

      // Check for conflicts
      const conflict = await appointmentRepository.findConflict(
        appointment.doctor,
        newDate,
        newStartTime,
        newEndTime,
        appointment._id,
      );
      if (conflict) {
        throw ApiError.conflict("This time slot is already booked");
      }

      appointment.date = newDate;
      appointment.startTime = newStartTime;
      appointment.endTime = newEndTime;
      appointment.status = "pending";
      await appointment.save();
      return appointment;
    }

    throw ApiError.badRequest("No valid update data provided");
  }
}

module.exports = new PatientService();
